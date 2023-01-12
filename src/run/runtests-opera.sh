#!/bin/bash

configFilePath="../tests/config.json"
configFile=$(cat $configFilePath)

sites=($(jq -r '.domains.sites' <<< $configFile | tr -d '[]," '))
subdomains=($(jq -r '.domains.subdomains' <<< $configFile | tr -d '[]," '))
ports=($(jq -r '.domains.ports' <<< $configFile | tr -d '[]," '))
browsers=($(jq -r '.browsers | keys[]' <<< $configFile | tr -d '[]," '))
storageModuleNames=($(jq -r '.storageModules | keys[]' <<< $configFile | tr -d '[]," '))

function install_app() {
    EXTENSION="${1#*.}"
    if [[ $EXTENSION == "dmg" ]]
    then
        VOLUME=`hdiutil attach -nobrowse $1 | grep /Volumes | sed 's/.*\/Volumes\//\/Volumes\//'`
        cp -rf "$VOLUME"/*.app /Applications
        hdiutil detach "$VOLUME"
    elif [[ $EXTENSION == "pkg" ]]
    then
        installer -pkg $1 -target /
    fi
    initial_run_opera
}

function install_app_using_installer() {
    osascript <<EOD
    tell application "System Events" to tell process "Opera Installer"
        delay 3
        key code 36
    end tell
    delay 30
EOD
    # Installer Opens Opera by default
    killall "Opera"

    # Ignore alert requesting change of default browser
    osascript <<EOD
    tell application "System Events" to tell process "CoreServicesUIAgent"
        click button 1 of window 1
    end tell
    delay 5
EOD
}

function uninstall_app() {
    rm -Rf /Applications/Opera.app
    reset_opera
}

function ensure_opera_is_closed() {
    open -a /Applications/Opera.app --args --no-first-run
    osascript <<EOD
    tell application "Opera"
        activate
        quit
    end tell
    delay 1
EOD
}

function reset_opera() {
    killall "Opera"
    rm -Rf ~/Library/Application\ Support/com.operasoftware.Opera
    rm -Rf ~/Library/Cookies/*
    rm -Rf ~/Library/Caches/com.operasoftware.Opera
    rm -Rf ~/Library/Preferences/com.operasoftware.Opera.plist
    rm -Rf ~/Library/Containers/com.operasoftware.*
    rm -Rf ~/Library/Saved\ Application\ State/com.operasoftware.Opera.savedState
}


function initial_run_opera() {
    osascript <<EOD
    # Clear Third-party developer restrictions
    try 
        set theAppPath to quoted form of "/Applications/Opera.app"
        do shell script "xattr -d com.apple.quarantine " & theAppPath
    end try
    try
        set theAppPath to quoted form of "/Applications/Opera.app/Contents/MacOS/Opera"
        do shell script "xattr -d com.apple.quarantine " & theAppPath
    end try
        
EOD
}

function visit_domain () {
    open -a /Applications/Opera.app --args --no-first-run --disable-update
    osascript <<EOD
    tell application "Opera"
        activate
        delay 2
        close every window
    end tell
    tell application "System Events" to tell process "Opera"
        click menu item "New Window" of menu "File" of menu bar 1
        set frontmost to true
        delay 1
    end tell
    tell application "System Events" to tell process "Opera"
        click menu item "New Tab" of menu "File" of menu bar 1
        set frontmost to true
        delay 1
    end tell
    tell application "Opera"
        set URL of active tab of front window to "$1"
        delay $2
        close active tab of front window
    end tell
    delay 1
EOD
}

function visit_domain_private () {
    open -a /Applications/Opera.app --args --no-first-run --disable-update
    osascript <<EOD
    tell application "Opera"
        activate
        delay 2
        close every window
    end tell
    tell application "System Events" to tell process "Opera"
        click menu item "New Private Window" of menu "File" of menu bar 1
        set frontmost to true
        delay 1
    end tell
    tell application "System Events" to tell process "Opera"
        click menu item "New Tab" of menu "File" of menu bar 1
        set frontmost to true
        delay 1
    end tell
    tell application "Opera"
        set URL of active tab of front window to "$1"
        delay $2
        close active tab of front window
    end tell
    delay 1
EOD
}

function close_opera_windows() {
    osascript <<EOD
    tell application "Opera"
        delay 1
        close every window
    end tell
    delay 1
EOD
}

function ensure_opera_is_closed() {
    open -a /Applications/Opera.app --args --no-first-run --disable-update
    osascript <<EOD
    tell application "Opera"
        activate
        delay 2
        quit
    end tell
    delay 1
EOD
}

function configToDomain() {
    if [[ $2 == "site" ]] 
    then
        eval "$1=${sites[$3]}"
    elif [[ $2 == "subdomain" ]]
    then
        eval "$1=${subdomains[$3]}"
    elif [[ $2 == "port" ]]
    then
        eval "$1=${ports[$3]}"
    fi
}

function clearBrowserData() {
    osascript <<EOD
    tell application "Opera"
        activate
        delay 2
        close every window
    end tell
    tell application "System Events" to tell process "Opera"
        click menu item "New Window" of menu "File" of menu bar 1
        set frontmost to true
        delay 1
    end tell
    tell application "System Events" to tell process "Opera"
        click menu item "New Tab" of menu "File" of menu bar 1
        set frontmost to true
        delay 1
    end tell
    tell application "Opera"
        set URL of active tab of front window to "opera://settings/clearBrowserData"
        delay 2
    end tell
    tell application "System Events" to tell process "Opera"
        key code 36
    end tell
    delay 2
    tell application "Opera"
        delay 2
        close active tab of front window
    end tell
EOD
}

browserVersions=(67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88)



for browserVersion in ${browserVersions[@]}
do
    echo "opera-${browserVersion}"
    browser="opera-${browserVersion}"

    # install_app "${browser}.dmg"

    for storageModule in "${storageModuleNames[@]}"
    do
        testsToPerform=($(jq -r .storageModules.$storageModule.testsToPerform <<< $configFile | tr -d '[]," '))
        delayBetweenVisits=($(jq -r .storageModules.$storageModule.delayBetweenVisits <<< $configFile | tr -d '[]," '))

        echo $storageModule

        for testModule in "${testsToPerform[@]}"
        do
            echo $testModule
                    
            subtests=($(jq -r ".testModules.${testModule} | keys[]" <<< $configFile | tr -d '[]," '))

            for subtest in "${subtests[@]}"
            do

                echo $subtest

                toPrivate=($(jq -r ".testModules.${testModule}.\"${subtest}\" | has(\"toPrivate\") "  <<< $configFile | tr -d '[]," '))
                fromPrivate=($(jq -r ".testModules.${testModule}.\"${subtest}\" | has(\"fromPrivate\") "  <<< $configFile | tr -d '[]," '))
                clearBrowserData=($(jq -r ".testModules.${testModule}.\"${subtest}\" | has(\"clearBrowserData\") "  <<< $configFile | tr -d '[]," '))

                writeDomainLevel=($(jq -r .testModules.${testModule}.\"${subtest}\".write.topLevel.domainLevel <<< $configFile | tr -d '[]," '))
                writeDomainIndex=($(jq -r .testModules.${testModule}.\"${subtest}\".write.topLevel.domainIndex <<< $configFile | tr -d '[]," '))
                configToDomain writeDomain $writeDomainLevel $writeDomainIndex


                readDomainLevel=($(jq -r .testModules.${testModule}.\"${subtest}\".read.topLevel.domainLevel <<< $configFile | tr -d '[]," '))
                readDomainIndex=($(jq -r .testModules.${testModule}.\"${subtest}\".read.topLevel.domainIndex <<< $configFile | tr -d '[]," '))
                configToDomain readDomain $readDomainLevel $readDomainIndex

                protocol="https"
                if [ "$storageModule" = "hsts" ]; then
                    protocol="http"
                fi
                
                ensure_opera_is_closed

                reset_opera

                initial_run_opera

                echo "https://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}"
                visit_domain "https://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}" 5

                ensure_opera_is_closed

                reset_opera

                initial_run_opera

                echo "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write"

                echo "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read"

                if [[ $fromPrivate == true ]]
                then
                    visit_domain_private "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                else
                    visit_domain "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                fi

                # If both, fromPrivate and toPrivate are true, i.e., withinPrivate, then don't close the private window in the interim.
                if [[ $fromPrivate == true ] && [ $toPrivate == true ]]
                then
                    echo "Within Private. Did not close all private tabs"
                else
                    close_opera_windows
                fi

                if [[ $clearBrowserData == true ]]
                then
                    clearBrowserData 
                fi

                if [[ $toPrivate == true ]]
                then
                    visit_domain_private "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read" $delayBetweenVisits
                else
                    visit_domain "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read" $delayBetweenVisits
                fi
            done
        done
    done

    uninstall_app

done



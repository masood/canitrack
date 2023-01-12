#!/bin/bash

mdls -name kMDItemVersion "/Applications/Safari.app"

configFilePath="./src/tests/config.json"
configFile=$(cat $configFilePath)

sites=($(jq -r '.domains.sites' <<< $configFile | tr -d '[]," '))
subdomains=($(jq -r '.domains.subdomains' <<< $configFile | tr -d '[]," '))
ports=($(jq -r '.domains.ports' <<< $configFile | tr -d '[]," '))
browsers=($(jq -r '.browsers | keys[]' <<< $configFile | tr -d '[]," '))
storageModuleNames=($(jq -r '.storageModules | keys[]' <<< $configFile | tr -d '[]," '))

function reset_safari() {
    rm -Rf ~/Library/Cookies/*
    rm -Rf ~/Library/Cache/*
    rm -Rf ~/Library/Safari/*
    rm -Rf ~/Library/Preferences/com.apple.Safari* 
    rm -Rf ~/Library/Containers/com.apple.Safari/*
    rm -Rf ~/Library/Caches/Apple\ -\ Safari\ -\ Safari\ Extensions\ Gallery
    rm -Rf ~/Library/Caches/Metadata/Safari
    rm -Rf ~/Library/Caches/com.apple.Safari
    rm -Rf ~/Library/Caches/com.apple.WebKit.PluginProcess
    rm -Rf ~/Library/Cookies/Cookies.binarycookies
    rm -Rf ~/Library/Preferences/Apple\ -\ Safari\ -\ Safari\ Extensions\ Gallery
    rm -Rf ~/Library/Preferences/com.apple.Safari.LSSharedFileList.plist
    rm -Rf ~/Library/Preferences/com.apple.Safari.RSS.plist
    rm -Rf ~/Library/Preferences/com.apple.Safari.plist
    rm -Rf ~/Library/Preferences/com.apple.WebFoundation.plist
    rm -Rf ~/Library/Preferences/com.apple.WebKit.PluginHost.plist
    rm -Rf ~/Library/Preferences/com.apple.WebKit.PluginProcess.plist
    rm -Rf ~/Library/PubSub/Database
    rm -Rf ~/Library/Saved\ Application\ State/com.apple.Safari.savedState

}

function clear_safari_data () {
    osascript <<EOD
        tell application "Safari"
            activate
            close every window
            delay 0.5
            tell application "System Events" to tell process "Safari"
                # clear cache (but it doesn't clear cookies)
                keystroke "e" using {option down, command down}
                delay 0.5
                # clear history (doesn't get cleared from preferences or cache)
                #clear history
				click menu item "Clear History…" of menu 1 of menu bar item "History" of menu bar 1
				try
					click pop up button 1 of window 1
					click menu item "all history" of menu 1 of pop up button 1 of window 1
					click button "Clear History" of window 1
				on error
					try
						click pop up button 1 of sheet 1 of window 1
						click menu item "all history" of menu 1 of pop up button 1 of sheet 1 of window 1
						click button "Clear History" of sheet 1 of window 1
					end try
				end try
                # open preferences
                keystroke "," using command down
                delay 2
                set prefWindow to name of window 0
                tell window 0
                    # go to privacy tab
                    click button "Privacy" of its toolbar
                    delay 0.5
                    # click on clear website data ...
                    click button 1 of group 1 of group 1
                    delay 2
                    # Remove all
                    click button "Remove All" of sheet 0
                end tell
                delay 2
                tell window 1
                    if button "Remove Now" exists then
                        # confirm in alert window
                        click button "Remove Now"
                    end if
                end tell
                delay 0.5
                tell window 0
                    click button "Done" of sheet 0
                end tell
                # close preferences
                if exists window 0 then
                    if name of window 0 = prefWindow then
                        keystroke "w" using command down
                    end if
                end if
                delay 0.5
                keystroke "w" using command down
            end tell
            close every window
            quit
        end tell
        delay 1
EOD
}


function visit_domain () {
    osascript <<EOD
    tell application "Safari"
        activate
        close every window
        open location "$1"
        delay $2
        close every window
    end tell
    delay 1
EOD
}

function visit_domain_private () {
    osascript <<EOD
    tell application "Safari"
        activate
        close every window
        tell application "System Events" to tell Process "Safari"
            click menu item "New Private Window" of menu "File" of menu bar 1
        end tell
        set URL of current tab of front window to "$1"
        delay $2
        close every window
    end tell
    delay 1
EOD
}

function ensure_safari_is_closed () {
    osascript <<EOD
    tell application "Safari"
        activate
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

reset_safari

for browser in "${browsers[@]}"
do

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
                
                ensure_safari_is_closed

                reset_safari

                visit_domain "${protocol}://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}" 5

                ensure_safari_is_closed

                reset_safari


                if [[ $fromPrivate == true ]]
                then
                    visit_domain_private "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                else
                    visit_domain "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                fi

                if [[ $clearBrowserData == true ]]
                then
                    clear_safari_data
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
done

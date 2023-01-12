#!/bin/bash

configFilePath="../tests/config.json"
configFile=$(cat $configFilePath)

sites=($(jq -r '.domains.sites' <<< $configFile | tr -d '[]," '))
subdomains=($(jq -r '.domains.subdomains' <<< $configFile | tr -d '[]," '))
ports=($(jq -r '.domains.ports' <<< $configFile | tr -d '[]," '))
browsers=($(jq -r '.browsers | keys[]' <<< $configFile | tr -d '[]," '))
storageModuleNames=($(jq -r '.storageModules | keys[]' <<< $configFile | tr -d '[]," '))

function install_app() {
        VOLUME=`hdiutil attach -nobrowse "$1" | grep /Volumes | sed 's/.*\/Volumes\//\/Volumes\//'`
        cp -rf "$VOLUME"/*.app /Applications
        hdiutil detach "$VOLUME"
}

function uninstall_app() {
    rm -Rf /Applications/Brave\ Browser.app
    reset_brave
}

function ensure_brave_is_closed() {
    osascript <<EOD
    tell application "Brave Browser"
        activate
        quit
    end tell
    delay 1
EOD
}

function reset_brave() {
    killall "Brave Browser"
    rm -Rf ~/Library/Application\ Support/BraveSoftware/Brave-Browser
    rm -Rf /Library/BraveSoftware
    rm -Rf ~/Library/Cookies/*
    rm -Rf ~/Library/Caches/BraveSoftware
    rm -Rf ~/Library/Caches/com.brave.*
    rm -Rf ~/Library/Caches/Metadata/BraveSoftware
    rm -Rf ~/Library/Preferences/com.brave.*
    rm -Rf ~/Library/Containers/com.brave.*
    rm -Rf ~/Library/Saved\ Application\ State/com.brave.Browser.savedState
}


function initial_run_brave() {
    osascript <<EOD
    # Clear Third-party developer restrictions
    try 
        set theAppPath to quoted form of "/Applications/Brave Browser.app"
        do shell script "xattr -d com.apple.quarantine " & theAppPath
    end try
    try
        set theAppPath to quoted form of "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
        do shell script "xattr -d com.apple.quarantine " & theAppPath
    end try

    tell application "Brave Browser"
        activate
        close every window
    end tell

    delay 1
        
    try
        tell application "System Events" to tell process "Brave Browser"
            click checkbox 1 of window "Welcome to Brave"
            click button "Start Brave" of window "Welcome to Brave"
        end tell
    end try

    delay 2

    tell application "Brave Browser"
        activate
        delay 1
        quit
    end tell

    delay 2
EOD
}

function visit_domain () {
    osascript <<EOD
    set testCompletedFound to false
    tell application "Brave Browser"
        activate
        delay 2
        close every window
        tell application "Brave Browser" to make new window
        set URL of active tab of front window to "$1"
        set timeElapsed to 0
        repeat while testCompletedFound is false
		    set testCompletedFound to execute front window's active tab javascript "document.contains(document.getElementById('testCompleted'))"
            set timeElapsed to timeElapsed + 0.1
            if (timeElapsed as number) >= ($2 as number) then
                set testCompletedFound to true
            end if
            delay 0.1
	    end repeat
        close every window
    end tell
    delay 1
EOD
}

function visit_domain_private () {
    # https://gist.github.com/zdne/7443950

    osascript <<EOD
    tell application "Brave Browser"
        activate
        delay 2
        close every window
        tell application "Brave Browser" to make new window with properties {mode:"incognito"}
        set URL of active tab of front window to "$1"
        set timeElapsed to 0
        set testCompletedFound to false
        repeat while testCompletedFound is false
            set testCompletedFound to execute front window's active tab javascript "document.contains(document.getElementById('testCompleted'))"
            set timeElapsed to (timeElapsed as number) + 0.1
            if (timeElapsed as number) >= ($2 as number) then
                set testCompletedFound to true
            end if
            delay 0.1
	    end repeat
        close every window
    end tell
    delay 1
EOD
}

function ensure_brave_is_closed() {
    osascript <<EOD
    tell application "Brave Browser"
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
        tell application "Brave Browser"
        activate
        close every window
        delay 1
        make new window
        set URL of active tab of front window to "brave://settings/clearBrowserData"
        delay 3
        execute active tab of front window javascript "(async () => {
            let querySelectorAll = (node,selector) => {
                    const nodes = [...node.querySelectorAll(selector)],
                        nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
                    let currentNode;
                    while (currentNode = nodeIterator.nextNode()) {
                        if(currentNode.shadowRoot) {
                            nodes.push(...querySelectorAll(currentNode.shadowRoot,selector));
                        }
                    }
                    return nodes;
                }

            // Set time range to all time
            let timeRangeMenu = querySelectorAll(document, 'select#dropdownMenu');
            timeRangeMenu.forEach(element => {
                if ('Time range' == element.getAttribute('aria-label')){
                    element.value=4;
                }
            });

            // Select all checkboxes
            let checkboxesFound = querySelectorAll(document, 'cr-checkbox#checkbox');
            checkboxesFound.forEach(element => {
                console.log(element.innerText);
                element.setAttribute('checked', 'checked');
                console.log(element.getAttribute('checked'));
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            let confirmButton = querySelectorAll(document, 'cr-button#clearBrowsingDataConfirm');
            confirmButton.forEach(element => {
                console.log(element);
                element.click();
            });
        })();
    "
    delay 2
    close every window   
    end tell
    delay 1
EOD
}

browserVersions=(1.21 1.23 1.25 1.27 1.29 1.30 1.31 1.32 1.34 1.35 1.36 1.37)

for browserVersion in ${browserVersions[@]}
do
    echo "brave-${browserVersion}"
    browser="brave-${browserVersion}"

    # install_app "Brave-Browser-x64-${browserVersion}.dmg"

    # initial_run_brave

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
                
                ensure_brave_is_closed

                reset_brave

                initial_run_brave

                contents="$(jq '.browser.allow_javascript_apple_events = true' ~/Library/Application\ Support/BraveSoftware/Brave-Browser/Default/Preferences)"
                echo -E "${contents}" > ~/Library/Application\ Support/BraveSoftware/Brave-Browser/Default/Preferences

                echo "https://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}"
                visit_domain "https://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}" 5

                ensure_brave_is_closed

                reset_brave

                initial_run_brave

                contents="$(jq '.browser.allow_javascript_apple_events = true' ~/Library/Application\ Support/BraveSoftware/Brave-Browser/Default/Preferences)"
                echo -E "${contents}" > ~/Library/Application\ Support/BraveSoftware/Brave-Browser/Default/Preferences

                echo "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write"

                echo "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read"

                if [[ $fromPrivate == true ]]
                then
                    visit_domain_private "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                else
                    visit_domain "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
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



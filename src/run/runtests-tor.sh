#!/bin/bash

configFilePath="../tests/config.json"
configFile=$(cat $configFilePath)

sites=($(jq -r '.domains.sites' <<< $configFile | tr -d '[]," '))
subdomains=($(jq -r '.domains.subdomains' <<< $configFile | tr -d '[]," '))
ports=($(jq -r '.domains.ports' <<< $configFile | tr -d '[]," '))
browsers=($(jq -r '.browsers | keys[]' <<< $configFile | tr -d '[]," '))
storageModuleNames=($(jq -r '.storageModules | keys[]' <<< $configFile | tr -d '[]," '))

function install_app() {
    hdiutil attach -nobrowse "$1"
    cp -rf /Volumes/Tor\ Browser/Tor\ Browser.app /Applications
    hdiutil detach /Volumes/Tor\ Browser

    # Clear Third-party Restrictions
    xattr -d com.apple.quarantine "/Applications/Tor Browser.app"
    xattr -d com.apple.quarantine "/Applications/Tor Browser.app/Contents/MacOS/firefox"
}


function reset_browser_state() {
    # Tor Browser uses the same process name as firefox
    killall firefox

    mkdir ~/Desktop/Tor
    mv ~/Library/Application\ Support/TorBrowser-Data ~/Desktop/
    rm -Rf ~/Desktop/Tor
    rm -Rf ~/Library/Preferences/org.torproject.*
    rm -Rf ~/Library/Containers/org.torproject.*
    rm -Rf ~/Library/Saved\ Application\ State/org.torproject.*

}


function uninstall_app() {
    rm -Rf /Applications/Tor\ Browser.app
    reset_browser_state
}

function clear_browser_data() {
   open /Applications/Tor\ Browser.app --args "-foreground"
    python3 <<EOD
import AppKit
import pyautogui
import time
import sys
sys.platform = '_'

# Reset Identity
pyautogui.hotkey('command','shift', 'u', interval=0.1)

time.sleep(1)

# Hit Enter to Connect to Tor Network
pyautogui.press('enter')

time.sleep(5)

EOD
}

function quit_browser() {
   open /Applications/Tor\ Browser.app --args "-foreground"
    sleep 1
    python3 <<EOD
import AppKit
import pyautogui
import time
import sys
sys.platform = '_'

# Command + q to quit
pyautogui.hotkey('command','q', interval=0.1)
time.sleep(1)
# Enter to handle the dialog that appears
pyautogui.press('enter')

time.sleep(1)

# pyautogui.press('enter')
EOD
}

function open_browser() {
    open /Applications/Tor\ Browser.app  --args "-foreground"
    sleep 2
    python3 <<EOD
import AppKit
import pyautogui
import pynput
from pynput.keyboard import Controller
import time
import sys
sys.platform = '_'

keyboard = Controller()

time.sleep(2)

# Connect to Tor Network
pyautogui.press('enter')
time.sleep(1)
# pyautogui.press('enter')

time.sleep(10)
EOD
}


function visit_domain_private () {
    open /Applications/Tor\ Browser.app --args "-foreground"
    sleep 2
    python3 <<EOD
import AppKit
import pyautogui
import pynput
from pynput.keyboard import Controller
import time
import sys
sys.platform = '_'

keyboard = Controller()

time.sleep(0.5)

#open private window 
pyautogui.hotkey('command','shift','p', interval=0.1)

time.sleep(0.5)

#Focus on URL Tab
pyautogui.hotkey('command','l', interval=0.1)

keyboard.type('$1')
# pyautogui.typewrite("$1", interval=0.05)
pyautogui.press('enter')

# Additional wait time because TOR
time.sleep(5)

# Wait for navigation to complete
time.sleep($2)

# Close all Private Tabs
pyautogui.hotkey('command','shift','w', interval=0.1)

time.sleep(0.5)
EOD
}

function visit_domain () {
    open /Applications/Tor\ Browser.app --args "-foreground" 
    sleep 2
    python3 <<EOD
import AppKit
import pyautogui
import pynput
from pynput.keyboard import Controller
import time
import sys
sys.platform = '_'

keyboard = Controller()

time.sleep(0.5)

# Connect to Tor Network
# pyautogui.press('enter')
# time.sleep(5)

#Open a new tab
pyautogui.hotkey('command','t', interval=0.1)


time.sleep(0.5)

#Focus on URL Tab
pyautogui.hotkey('command','l', interval=0.1)

time.sleep(0.5)

pyautogui.press('esc')

# Type in the URL
keyboard.type('$1')
# pyautogui.typewrite('$1', interval=0.05)
pyautogui.press('enter')

# Additional wait time because TOR
time.sleep(5)

# Wait for navigation to complete
time.sleep($2)

# Close the tab
pyautogui.hotkey('command', 'w', interval=0.1)

time.sleep(0.5)
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

browserVersions=(10-5-2 10-5-4 10-5-5 10-5-6 10-5-8 10-5-10 11-0-2 11-0-3 11-0-4 11-0-6 11-0-7 11-0-9 11-0-10 11-0-11)


for browserVersion in ${browserVersions[@]}
do
    echo "tor-${browserVersion}"
    browser="tor-${browserVersion}"

    # install_app "tor-browser-${browserVersion}.dmg"

    for storageModule in "${storageModuleNames[@]}"
    do
        testsToPerform=($(jq -r .storageModules.$storageModule.testsToPerform <<< $configFile | tr -d '[]," '))
        delayBetweenVisits=($(jq -r .storageModules.$storageModule.delayBetweenVisits <<< $configFile | tr -d '[]," '))

        echo $storageModule

        for testModule in "${testsToPerform[@]}"
        do
            
            subtests=($(jq -r ".testModules.${testModule} | keys[]" <<< $configFile | tr -d '[]," '))
            
            for subtest in "${subtests[@]}"
            do

                reset_browser_state

                open_browser

                # echo $subtest

                toPrivate=($(jq -r ".testModules.${testModule}.\"${subtest}\" | has(\"toPrivate\") "  <<< $configFile | tr -d '[]," '))
                fromPrivate=($(jq -r ".testModules.${testModule}.\"${subtest}\" | has(\"fromPrivate\") "  <<< $configFile | tr -d '[]," '))
                clearBrowserData=($(jq -r ".testModules.${testModule}.\"${subtest}\" | has(\"clearBrowserData\") "  <<< $configFile | tr -d '[]," '))

                writeDomainLevel=($(jq -r .testModules.${testModule}.\"${subtest}\".write.topLevel.domainLevel <<< $configFile | tr -d '[]," '))
                writeDomainIndex=($(jq -r .testModules.${testModule}.\"${subtest}\".write.topLevel.domainIndex <<< $configFile | tr -d '[]," '))
                configToDomain writeDomain $writeDomainLevel $writeDomainIndex


                readDomainLevel=($(jq -r .testModules.${testModule}.\"${subtest}\".read.topLevel.domainLevel <<< $configFile | tr -d '[]," '))
                readDomainIndex=($(jq -r .testModules.${testModule}.\"${subtest}\".read.topLevel.domainIndex <<< $configFile | tr -d '[]," '))
                configToDomain readDomain $readDomainLevel $readDomainIndex

                protocol='https'
                if [ "$storageModule" = "hsts" ]; then
                    protocol='http'
                fi

                echo "https://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}"
                visit_domain "https://${sites[0]}/tests/current/create/${storageModule}/${browser}/${testModule}/${subtest}" 5

                if [[ $fromPrivate == true ]]
                then
                    echo "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write"
                    visit_domain_private "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                else
                    echo "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write"
                    visit_domain "${protocol}://${writeDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/write" $delayBetweenVisits
                fi

                if [[ $clearBrowserData == true ]]
                then
                    clear_browser_data
                fi

                if [[ $toPrivate == true ]]
                then
                    echo "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read"
                    visit_domain_private "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read" $delayBetweenVisits
                else
                    echo "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read"
                    visit_domain "${protocol}://${readDomain}/tests/server/${storageModule}/${browser}/${testModule}/${subtest}/read" $delayBetweenVisits
                fi

                quit_browser

            done
        done
    done

    quit_browser

    uninstall_app
done
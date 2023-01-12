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
    cp -rf /Volumes/Firefox/Firefox.app /Applications
    hdiutil detach /Volumes/Firefox

    # Clear Third-party Restrictions
    xattr -d com.apple.quarantine "/Applications/Firefox.app"
    xattr -d com.apple.quarantine "/Applications/Firefox.app/Contents/MacOS/firefox"
}


function reset_browser_state() {
    killall firefox

    mkdir ~/Desktop/Firefox
    mv ~/Library/Application\ Support/Firefox ~/Desktop/
    rm -Rf ~/Desktop/Firefox
    rm -Rf /Library/Firefox
    rm -Rf ~/Library/Cookies/*
    rm -Rf ~/Library/Caches/Firefox
    rm -Rf ~/Library/Caches/org.mozilla.*
    rm -Rf ~/Library/Caches/Metadata/Mozilla
    rm -Rf ~/Library/Preferences/org.mozilla.*
    rm -Rf ~/Library/Containers/org.mozilla.*
    rm -Rf ~/Library/Saved\ Application\ State/org.mozilla.*

}


function uninstall_app() {
    rm -Rf /Applications/Firefox.app
    reset_browser_state
}

# Click Co-ordinates for Clear Browser Data
# Options: X:1415 Y: 90 RGB (82,81,95)
# History: X:1372 Y: 314
# Clear Recent History: X: 1276 Y: 279
# Time Range Drop Down: X: 715 Y: 160
# All Time: X: 715 Y: 229
# Browsing History: X: 556 Y: 233
# Active Logins: X: 560 Y: 264
# Form and Search History: X: 554  Y: 263 
# Cookies: X: 744 Y: 233 RGB (x,x, 255)
# Cache: X: 556  Y: 292
# Site Settings: X: 557   Y: 362
# Offline Website Data: X: 745 Y: 361
# OK button: X: 865 Y: 408

function clear_browser_data() {
   open /Applications/Firefox.app --args "-foreground"
    python3 <<EOD
import AppKit
import pyautogui
import time
import sys
sys.platform = '_'

checkboxes = {
    'Browsing History': {
        'X': 558, 'Y': 332
        },
    'Active Logins': {
        'X': 558, 'Y': 355
        },
    'Form and Search History': {
        'X': 558, 'Y': 392
        },
    'Cookies': {
        'X': 745, 'Y': 328
        },
    'Cache': {
        'X': 747, 'Y': 355
        },
    'Site Settings': {
        'X': 561, 'Y': 456
        },
    'Offline Website Data': {
        'X': 745, 'Y': 456
        }
    }

pyautogui.hotkey('command','t', interval=0.1)

# Command + Shift + Delete for Clearing History
pyautogui.hotkey('command','shift','delete', interval=0.1)

time.sleep(1)

# Hit Enter to Delete
pyautogui.press('enter')

time.sleep(2)

pyautogui.hotkey('command','w', interval=0.1)

# for option, coordinates in checkboxes.items():
#     if pyautogui.pixel(coordinates['X'], coordinates['Y']).blue < 200:
#         pyautogui.click(coordinates['X'], coordinates['Y'])

# Click Ok Button
# pyautogui.click(x=869, y=502)
EOD
}

function quit_browser() {
   open /Applications/Firefox.app --args "-foreground"
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
   open /Applications/Firefox/MacOS/Firefox/  --args "-foreground"
    sleep 10
}


function visit_domain_private () {
    open /Applications/Firefox.app --args "-foreground"
    sleep 2
#     osascript<<EOD
#     tell application "firefox"
#         delay 5
#         activate
#     end tell
# EOD
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

# Wait for navigation to complete
time.sleep($2)

# Close all Private Tabs
pyautogui.hotkey('command','shift','w', interval=0.1)

time.sleep(0.5)
EOD
}

function visit_domain () {
    open /Applications/Firefox.app --args "-foreground" 
    sleep 2
#     osascript<<EOD
#     tell application "firefox"
#         delay 5
#         activate
#     end tell
# EOD
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

uninstall_app

browserVersions=(85 90 95 99)

for browserVersion in ${browserVersions[@]}
do
    echo "firefox-${browserVersion}.0"
    browser="firefox-${browserVersion}.0"

    # install_app "Firefox ${browserVersion}.0.dmg"

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
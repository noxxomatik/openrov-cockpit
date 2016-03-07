#!/bin/sh

# This code will try to automatically detect known motor/power boards and configure the correctly tailored command for them*/

canTalkToATMEGAviaSPI(){
    avrdude -P /dev/spidev0.0 -c linuxspi -vv -p m2560 > /dev/null 2>&1
    if [ $? -ne 0 ] 
    then
        return 1
    else
        return 0
    fi
    
}

export ROV_BOARD=custom

# Temporary trident detection
if grep -q "trident" /opt/board ; then
	export ROV_BOARD=trident
elif canTalkToATMEGAviaSPI ; then
    	export ROV_BOARD=board25
else
    	export ROV_BOARD=cape
fi

echo "$ROV_BOARD" > /var/run/rov_board

exit 0


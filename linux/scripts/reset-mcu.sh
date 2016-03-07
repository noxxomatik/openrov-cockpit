#!/bin/bash
set -e

# Load the config variables for the attached board
source /opt/openrov/cockpit/linux/scripts/get-board-config.sh

echo "Initiating MCU Reset..."

gpio -g write $MCU_RESET_PIN 0

sleep 0.25

gpio -g write $MCU_RESET_PIN 1

echo "MCU reset!"


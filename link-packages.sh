#!/bin/bash

# Define the base directory
BASE_DIR="./dist/packages"

# Flags
DRY_RUN=0
LINK=0
UNLINK=0
SPECIFIC_PACKAGE=""

# Process arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=1
            echo "❗️ Dry run mode activated. No actual linking will be performed."
            ;;
        --link)
            LINK=1
            # Check if the next argument is not another flag
            if [[ "$2" && ! "$2" =~ ^-- ]]; then
                SPECIFIC_PACKAGE="$2"
                shift # Shift to skip the next argument in the loop
            fi
            ;;
        --unlink)
            UNLINK=1
            ;;
    esac
    shift # Move to the next argument
done

# Function to process directories
process_directory() {
    for dir in "$1"/*; do

        # Check if it's a directory
        if [[ -d "$dir" ]]; then
            # Extract the directory name
            dir_name=$(basename "$dir")

            # If a specific package is provided, skip others
            if [[ "$SPECIFIC_PACKAGE" && "$dir_name" != "$SPECIFIC_PACKAGE" ]]; then
                continue
            fi

            # Check if directory name does not end with "vanilla"
            if [[ ! $dir_name =~ .*-vanilla$ ]]; then
                echo "Processing directory: $dir_name"

                # Check if dry run mode is off
                if [[ $DRY_RUN -eq 0 ]]; then
                    if [[ $LINK -eq 1 ]]; then
                        cd "$dir"
                        npm link
                        cd - > /dev/null
                    elif [[ $UNLINK -eq 1 ]]; then
                        if [[ -f "$dir/package.json" ]]; then
                            # Read package name from package.json
                            package_name=$(jq -r .name "$dir/package.json")
                            echo "Unlinking package: $package_name"
                            npm uninstall -g "$package_name"
                        else
                            echo "Warning: No package.json found in $dir_name. Skipping unlink."
                        fi
                    fi
                fi
            fi
        fi
    done
}

# Start processing from the base directory
process_directory "$BASE_DIR"

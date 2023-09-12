#!/bin/bash

# Usage:
# -- Dry run mode
# ./link-packages.sh --dry-run

# -- Link all packages (except those ending with "-vanilla") or specific packages
# ./link-packages.sh --link
# ./link-packages.sh --link <project-directory-name1> <project-directory-name2> ...
# eg. ./link-packages.sh --link lit-node-client another-project

# -- Unlink all packages (except those ending with "-vanilla") or specific packages
# ./link-packages.sh --unlink
# ./link-packages.sh --unlink <project-directory-name1> <project-directory-name2> ...

# -- Specify base directory
# ./link-packages.sh --dir <base-directory-path>

# Define the base directory
BASE_DIR="./dist/packages"

# Flags
DRY_RUN=0
LINK=0
UNLINK=0
declare -a SPECIFIC_PACKAGES=()

# Process arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=1
            echo "❗️ Dry run mode activated. No actual linking will be performed."
            ;;
        --dir)
            shift
            BASE_DIR="$1"
            ;;
        --link|--unlink)
            if [[ $1 == "--link" ]]; then
                LINK=1
            else
                UNLINK=1
            fi
            shift
            while [[ "$1" && ! "$1" =~ ^-- ]]; do
                SPECIFIC_PACKAGES+=("$1")
                shift
            done
            continue  # Skip the shift at the end of the loop
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
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

            # If specific packages are provided, skip others
            if [[ ${#SPECIFIC_PACKAGES[@]} -ne 0 && ! " ${SPECIFIC_PACKAGES[@]} " =~ " $dir_name " ]]; then
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
                            npm unlink -g "$package_name"
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
npm list -g --depth=0 | grep '@lit-protocol/'

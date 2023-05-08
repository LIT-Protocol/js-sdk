#!/bin/bash

# This script runs 'yarn build' 10 times and logs the number of failed builds.

total_runs=3
failed_runs=0

for i in $(seq 1 $total_runs); do
  echo "Running 'yarn build' for the $i time..."

  echo "Start Time: $start_time" >> "build_log_$i.txt"
  yarn build 2>&1 | sed "s/\x1B\[[0-9;]*[a-zA-Z]//g" > "build_log_$i.txt"
  end_time=$(date +%Y-%m-%d_%H-%M-%S)
  echo "End Time: $end_time" >> "build_log_$i.txt"

  if [ $? -ne 0 ]; then
    echo "Build $i failed. Log saved to build_log_$i.txt"
    failed_runs=$((failed_runs+1))
  else
    echo "Finished 'yarn build' for the $i time."
    # rm "build_log_$i.txt" # Remove the log if the build is successful
  fi
done

echo "All $total_runs 'yarn build' runs completed. Failed builds: $failed_runs"

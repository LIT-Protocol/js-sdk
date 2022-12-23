// @ts-nocheck
import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { SelectItem } from './ui-select-item';

export const SelectMenu = ({ onChange, items, label }) => (
  <Select.Root onValueChange={onChange}>
    <Select.Trigger className="SelectTrigger" aria-label="Food">
      <Select.Value placeholder={label ?? 'Select Item'} />
      <Select.Icon className="SelectIcon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="SelectContent">
        <Select.ScrollUpButton className="SelectScrollButton">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="SelectViewport">
          <Select.Group>
            {!items
              ? ''
              : items.map((item, index) => {
                  // capitalize first letter of each word
                  const calitalized = item.name
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  if (item.type === 'label') {
                    return (
                      <Select.Label key={index} className="SelectLabel">
                        {calitalized}
                      </Select.Label>
                    );
                  }

                  return (
                    <SelectItem
                      key={index}
                      value={item.name}
                      disabled={!item.enabled}
                    >
                      {calitalized}
                    </SelectItem>
                  );
                })}
          </Select.Group>

          {/* <Select.Separator className="SelectSeparator" /> */}
        </Select.Viewport>
        <Select.ScrollDownButton className="SelectScrollButton">
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

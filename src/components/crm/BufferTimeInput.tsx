import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BufferTimeInput = ({
  onValueChange,
  bufferTime = 30
}: {
  onValueChange: (val: number) => void;
  bufferTime: number;
}) => {
  return (
    <div className="w-full flex gap-5 items-center">
      <div className="w-[15rem]">
        <Select
          value={bufferTime.toString()}
          onValueChange={(val) => onValueChange(parseInt(val))}
        >
          <SelectTrigger id="bufferTime">
            <SelectValue placeholder="Select buffer time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm font-normal text-nowrap">After Appointment</div>
    </div>
  )
}
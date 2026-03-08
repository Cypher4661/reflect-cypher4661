import { useCallback } from "react";
import { z } from "zod";

import { Input } from "@ui/input";
import { TruncateText } from "@ui/truncate-text";

import { EditorBlock } from "./parts/EditorBlock";
import { EditorContainer } from "./parts/EditorContainer";
import { EditorSwitchBlock } from "./parts/EditorSwitchBlock";
import { Slot } from "./slot";
import { withPreview } from "./utils";

import type { DataChannelRecord, DataType, StructuredTypeDescriptor } from "@2702rebels/wpidata/abstractions";
import type { StringChooserSendable } from "@2702rebels/wpidata/types/sendable";
import type { WidgetComponentProps, WidgetDescriptor, WidgetEditorProps } from "./types";

// 🔹 Import סטטי של כל התמונות
import imgNone from "../assets/none.png";
import imgIntake from "../assets/intake.png";
import imgShootHub from "../assets/shoot_hub.png";
import imgShootTest from "../assets/shoot_test.png";
import imgShootTower from "../assets/shoot_tower.png";
import imgShootDelivery from "../assets/shoot_delivery.png";
import imgClimb from "../assets/climb.png";

// ✅ Preview עם המודים החדשים
const previewData: ReturnType<typeof transform> = {
  options: ["NONE", "INTAKE", "SHOOT_HUB", "SHOOT_TEST", "SHOOT_TOWER", "SHOOT_DELIVERY", "CLIMB"],
  active: "NONE",
  selected: "NONE",
};

const propsSchema = z.object({
  title: z.string().optional(),
  interactive: z.boolean().default(true),
});

const pathSelected = ["selected"];
type PropsType = z.infer<typeof propsSchema>;

// 🔹 פונקציית transform
const transform = (
  dataType: DataType,
  records: ReadonlyArray<DataChannelRecord>,
  structuredType: StructuredTypeDescriptor | undefined
) => {
  if (records.length === 0) return undefined;

  const value = records.at(-1)?.value;
  try {
    if (
      value != null &&
      typeof value === "object" &&
      structuredType &&
      structuredType.format === "composite" &&
      structuredType.name === "String Chooser"
    ) {
      const v = value as unknown as StringChooserSendable;
      return {
        options: [...v.options].sort(),
        active: v.active,
        selected: v.selected,
      } as const;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

// 🔹 מפת תמונות סטטית
const imageMap: Record<string, string> = {
  NONE: imgNone,
  INTAKE: imgIntake,
  SHOOT_HUB: imgShootHub,
  SHOOT_TEST: imgShootTest,
  SHOOT_TOWER: imgShootTower,
  SHOOT_DELIVERY: imgShootDelivery,
  CLIMB: imgClimb,
};

const Component = ({ mode, slot, data, props, publish }: WidgetComponentProps<PropsType>) => {
  const interactive = props.interactive;

  const handleChange = useCallback(
    (v: string) => {
      if (interactive && publish) publish(v, pathSelected);
    },
    [interactive, publish]
  );

  const [d, preview] = withPreview(mode, data as ReturnType<typeof transform>, previewData);

  return (
    <div className="flex h-full w-full flex-col py-2 select-none">

      {/* כותרת */}
      <div className="mb-1 flex px-3">
        <TruncateText variant="head" className="text-sm font-bold">
          {mode === "template" ? "Preview" : props.title || Slot.formatAsTitle(slot)}
        </TruncateText>
      </div>

      {/* שורה של ריבועים */}
      <div className="relative flex-1 px-3 flex items-center justify-center">
        {d != null && (
          <div className="flex gap-2 w-full">

            {d.options.map((opt) => {
              const selected = d.selected === opt;

              return (
                <button
                  key={opt}
                  disabled={!interactive}
                  onClick={() => handleChange(opt)}
                  className={`
                    flex-1 aspect-square flex items-center justify-center
                    border rounded-lg transition-all duration-200
                    ${selected ? "border-blue-500 shadow-lg" : "border-gray-300"}
                    ${preview ? "opacity-25" : ""}
                  `}
                >
                  <img
                    src={imageMap[opt]}
                    alt={opt}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

const Editor = ({ props, onPropsChange }: WidgetEditorProps<PropsType>) => {
  return (
    <EditorContainer>
      <EditorBlock label="Title">
        <Input
          value={props.title ?? ""}
          onChange={(ev) =>
            onPropsChange({ ...props, title: ev.currentTarget.value })
          }
          placeholder="Optional widget title"
        />
      </EditorBlock>

      <EditorSwitchBlock
        label="Interactive"
        checked={props.interactive}
        onCheckedChange={(v) =>
          onPropsChange({ ...props, interactive: v })
        }
      />
    </EditorContainer>
  );
};

export const WidgetChooserDescriptor: WidgetDescriptor<PropsType> = {
  type: "chooser",
  name: "Chooser",
  icon: "square-tasks",
  description: "Value chooser from a set of options",
  width: 10,
  height: 5,

  constraints: {
    width: { min: 6 },
    height: { min: 4 },
  },

  slot: {
    transform,
    accepts: {
      composite: ["String Chooser"],
    },
  },

  component: (props) => <Component {...props} />,

  props: {
    schema: propsSchema,
    defaultValue: {
      interactive: propsSchema.shape.interactive.def.defaultValue,
    },
    editor: (props) => <Editor {...props} />,
  },
};
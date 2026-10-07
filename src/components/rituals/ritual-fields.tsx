import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  RITUAL_INTEGRATIONS,
  RITUAL_MOMENTS,
  WEEKDAYS,
} from "@/lib/rituals/options";
import type { RitualFormValues } from "@/lib/rituals/form";
import { IntegrationIcon } from "@/components/integration-icon";
import { TextAreaField, TextField } from "@/components/text-field";
import { StepsField } from "./steps-field";

// The inputs of a ritual form, read by readRitualValues on the server.
// `minimal` leaves out the description and integrations, keeping whatever
// values they already have.
export function RitualFields({
  values,
  minimal = false,
}: {
  values: RitualFormValues;
  minimal?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <TextField
          label="Name"
          name="title"
          placeholder="e.g. Friday wrap-up"
          defaultValue={values.title}
          maxLength={MAX_TITLE_LENGTH}
          required
          autoFocus
        />
        {minimal ? (
          <input type="hidden" name="description" value={values.description} />
        ) : (
          <TextAreaField
            label="Description (optional)"
            name="description"
            defaultValue={values.description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={2}
          />
        )}
      </div>

      <StepsField initial={values.steps} />

      <fieldset className="fieldset">
        <legend className="fieldset-legend">When</legend>
        <div className="grid grid-cols-2 gap-2">
          {RITUAL_MOMENTS.map((moment) => (
            <label
              key={moment.id}
              className="flex cursor-pointer flex-col gap-0.5 rounded-box border border-base-300 p-3 transition-colors has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:outline-2 has-focus-visible:outline-primary"
            >
              <input
                type="radio"
                name="moment"
                value={moment.id}
                defaultChecked={values.moment === moment.id}
                className="sr-only"
              />
              <span className="text-sm font-medium">{moment.label}</span>
              <span className="text-xs text-base-content/60">
                {moment.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Repeat on</legend>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => (
            <input
              key={day.id}
              type="checkbox"
              name="days"
              value={day.id}
              aria-label={day.short}
              title={day.long}
              defaultChecked={values.days.includes(day.id)}
              className="btn btn-sm btn-circle size-10 checked:btn-primary"
            />
          ))}
        </div>
      </fieldset>

      {minimal ? (
        values.integrations.map((id) => (
          <input key={id} type="hidden" name="integrations" value={id} />
        ))
      ) : (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Integrations
            <span className="badge badge-ghost badge-sm font-normal">
              Coming soon
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {RITUAL_INTEGRATIONS.map((integration) => (
              <label
                key={integration.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-box border border-base-300 p-3 transition-colors has-checked:border-primary has-checked:bg-primary/10"
              >
                <input
                  type="checkbox"
                  name="integrations"
                  value={integration.id}
                  defaultChecked={values.integrations.includes(integration.id)}
                  className="checkbox checkbox-sm checkbox-primary mt-0.5"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <IntegrationIcon
                      integration={integration.id}
                      className="size-4 shrink-0 text-base-content/80"
                    />
                    {integration.label}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {integration.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="label">
            Pick what this ritual should look at. Connecting accounts is on the
            way.
          </p>
        </fieldset>
      )}
    </>
  );
}

// A ritual as hidden inputs, for saving it as it is without showing the form.
export function HiddenRitualFields({ values }: { values: RitualFormValues }) {
  return (
    <>
      <input type="hidden" name="title" value={values.title} />
      <input type="hidden" name="description" value={values.description} />
      <input type="hidden" name="moment" value={values.moment} />
      {values.steps.map((step, i) => (
        <input key={`step-${i}`} type="hidden" name="steps" value={step} />
      ))}
      {values.days.map((day) => (
        <input key={`day-${day}`} type="hidden" name="days" value={day} />
      ))}
      {values.integrations.map((id) => (
        <input key={id} type="hidden" name="integrations" value={id} />
      ))}
    </>
  );
}

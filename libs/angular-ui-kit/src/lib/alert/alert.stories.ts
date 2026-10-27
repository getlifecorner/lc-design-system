import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AlertComponent } from './alert.component';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<AlertComponent> = {
  title: 'Feedback/Alert',
  component: AlertComponent,
  parameters: {
    docs: {
      description: {
        component: `
The Alert component displays inline notifications and messages.
Use it to inform users about important state changes, errors, warnings, or confirmations.

**Key Features:**
- 4 semantic variants (success, error, warning, info)
- Optional title and icon
- Dismissible option with close button
- Action slot (\`slot="action"\`) for a button right of the body, e.g. retry;
  3.3: \`actionsLayout="stacked"\` puts several actions in their own row below the text
- 3.12: a text link as the one way forward (\`<a slot="action" href="…">\`, e.g. an address): a 44 × 44 px target,
  link colour, an underline and a focus ring; inline it sits right of the text and drops below it under 576 px of
  alert width. For a link that looks like a button use \`<a lcButton slot="action">\`
- 3.13.1 (G-WL4): when the space inside the alert's border is below 16rem (alerts under 258 px at 100 % text,
  514 px at 200 %), the alert switches to a narrow layout (TD-1): the icon shares the first row with the title,
  message and actions take the full width below, and the padding is one density step smaller. There, long words
  hyphenate with \`hyphens: auto\`, which needs the page's \`lang\` (for example \`<html lang="de">\`). Without a
  \`lang\`, a word wider than the line still breaks, without a hyphen, so no text leaves the alert
- 3.3: the variant icon is decorative unless \`iconAriaLabel\` names it — no built-in English word
- Accessible: role="alert" for error / warning, role="status" otherwise; \`visible\` is two-way bindable
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Semantic variant determining color and default icon',
      table: { defaultValue: { summary: 'info' } },
    },
    title: { control: 'text', description: 'Optional bold title' },
    message: { control: 'text', description: 'Alert message (alternative to ng-content)' },
    dismissible: { control: 'boolean', description: 'Shows a close button' },
    showIcon: { control: 'boolean', description: 'Show/hide the status icon', table: { defaultValue: { summary: 'true' } } },
    iconAriaLabel: {
      control: 'text',
      description:
        '3.3: accessible name of the variant icon (e.g. „Warnung“). Unset = decorative icon (`aria-hidden`); the title and colour carry the tone. The kit sets no default text.',
    },
    actionsLayout: {
      control: 'inline-radio',
      options: ['inline', 'stacked'],
      description:
        '3.3: `inline` — one action right of the body (3.2); 3.12: a text link (`<a slot="action">`) takes up to half the row and drops below the text under 576 px of alert width. `stacked` — the actions in their own row below the text; below 576 px of alert width one per line at full width, 8 px apart, from 576 px side by side at natural width (a text link keeps its text width).',
      table: { defaultValue: { summary: 'inline' } },
    },
  },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Info: Story = {
  args: { variant: 'info', title: 'New Feature Available', message: 'You can now export your data as CSV. Check the settings page for more options.' },
};

export const Success: Story = {
  args: { variant: 'success', title: 'Payment Successful', message: 'Your subscription has been renewed. Next billing date: May 15, 2026.' },
};

export const Warning: Story = {
  args: { variant: 'warning', title: 'Storage Almost Full', message: 'You have used 90% of your storage quota. Consider upgrading your plan or deleting unused files.' },
};

export const Error: Story = {
  args: { variant: 'error', title: 'Connection Failed', message: 'Unable to reach the server. Please check your internet connection and try again.' },
};

export const Dismissible: Story = {
  parameters: {
    docs: { description: { story: 'Dismissible alerts show a close button. The `dismissed` event fires when clicked; bind `[(visible)]` to show the alert again later.' } },
  },
  args: { variant: 'info', title: 'Cookie Consent', message: 'We use cookies to improve your experience. By continuing, you agree to our privacy policy.', dismissible: true },
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Project a button with `slot="action"` to render it right of the alert body — the standard "error state with retry" pattern.',
      },
    },
  },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  render: () => ({
    template: `
      <lc-alert variant="error" title="Laden fehlgeschlagen" message="Die Vorhaben-Liste konnte nicht geladen werden.">
        <lc-button slot="action" variant="outline" size="sm">Erneut versuchen</lc-button>
      </lc-alert>`,
  }),
};

export const WithoutTitle: Story = {
  parameters: {
    docs: { description: { story: 'Alerts work without a title for simpler messages.' } },
  },
  args: { variant: 'success', message: 'Your changes have been saved.' },
};

export const WithoutIcon: Story = {
  args: { variant: 'info', title: 'Note', message: 'This alert has no icon for a minimal look.', showIcon: false },
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: 'Side-by-side comparison of all alert variants.' } },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lc-alert variant="info" title="Information">This is a general informational message for the user.</lc-alert>
        <lc-alert variant="success" title="Success">The operation completed successfully.</lc-alert>
        <lc-alert variant="warning" title="Warning">Please review the following items before proceeding.</lc-alert>
        <lc-alert variant="error" title="Error">Something went wrong. Please try again later.</lc-alert>
      </div>`,
  }),
};

export const FormValidation: Story = {
  parameters: {
    docs: { description: { story: 'Common pattern: showing validation errors above a form.' } },
  },
  render: () => ({
    template: `
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <lc-alert variant="error" title="Please fix the following errors:">
          <ul style="margin: 4px 0 0; padding-left: 16px; font-size: 14px;">
            <li>Email address is required</li>
            <li>Password must be at least 8 characters</li>
          </ul>
        </lc-alert>
        <lc-input label="Email" placeholder="you@example.com" error="Email is required"></lc-input>
        <lc-input label="Password" type="password" placeholder="••••••••" error="Minimum 8 characters"></lc-input>
      </div>`,
  }),
};

/** 3.3 (AS-11): two answers below the text — full width on a phone, side by side from 576 px. */
export const StackedActions: Story = {
  name: 'Stacked actions (3.3)',
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="max-width: 312px;">
          <lc-alert variant="warning" title="Du hast nur einen Passkey" message="Ohne einen zweiten kommst du nicht mehr in dein Konto, wenn dieses Gerät fehlt." [showIcon]="false" actionsLayout="stacked">
            <lc-button slot="action" variant="outline" size="lg">Zweiten Passkey einrichten</lc-button>
            <lc-button slot="action" variant="ghost" size="lg">Später</lc-button>
          </lc-alert>
        </div>
        <lc-alert variant="warning" title="Du hast nur einen Passkey" message="Ohne einen zweiten kommst du nicht mehr in dein Konto, wenn dieses Gerät fehlt." iconAriaLabel="Warnung" actionsLayout="stacked">
          <lc-button slot="action" variant="outline" size="lg">Zweiten Passkey einrichten</lc-button>
          <lc-button slot="action" variant="ghost" size="lg">Später</lc-button>
        </lc-alert>
      </div>
    `,
  }),
};


const CONTACT_LINK = `<a slot="action" href="mailto:kontakt-formular-adresse@beispiel-firma.example">Schreiben Sie uns direkt an kontakt-formular-adresse@beispiel-firma.example</a>`;
const SHORT_LINK = `<a slot="action" href="mailto:kontakt@beispiel.example">kontakt@beispiel.example</a>`;

/**
 * 3.12 (G-CF8): a text link as the one way forward, e.g. the address on a
 * 503 / 429 page. The box is at least 44 × 44 px with the text flush with the
 * body; link colour and an underline. From 576 px of alert width it sits right
 * of the text (up to half the row), below that it drops under the text.
 */
export const LinkAction: Story = {
  name: 'Link Action (G-CF8)',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lc-alert variant="info" title="Lieber direkt?" message="Sie können uns auch ohne das Formular erreichen." [dismissible]="true" closeAriaLabel="Hinweis schließen">
          ${CONTACT_LINK}
        </lc-alert>
        <lc-alert variant="success" title="Nachricht gesendet" message="Wir antworten in der Regel innerhalb von zwei Werktagen.">
          ${CONTACT_LINK}
        </lc-alert>
        <lc-alert variant="warning" title="Zu viele Anfragen" message="Bitte versuchen Sie es in einer Stunde noch einmal.">
          ${CONTACT_LINK}
        </lc-alert>
        <lc-alert variant="error" title="Senden gerade nicht möglich" message="Wir können Ihre Nachricht gerade nicht senden.">
          ${CONTACT_LINK}
        </lc-alert>
      </div>`,
  }),
};

/**
 * 3.12 (G-CF8): text links in the stacked layout. The 503 alert offers a
 * button and the address side by side from 576 px; the link keeps its text
 * width (a short address stays short) and lines up with the text.
 */
export const LinkActionStacked: Story = {
  name: 'Link Action, Stacked (G-CF8)',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lc-alert variant="info" title="Lieber direkt?" message="Sie können uns auch ohne das Formular erreichen." actionsLayout="stacked">
          ${SHORT_LINK}
        </lc-alert>
        <lc-alert variant="success" title="Nachricht gesendet" message="Wir antworten in der Regel innerhalb von zwei Werktagen." actionsLayout="stacked">
          ${SHORT_LINK}
        </lc-alert>
        <lc-alert variant="warning" title="Zu viele Anfragen" message="Bitte versuchen Sie es in einer Stunde noch einmal." actionsLayout="stacked">
          ${CONTACT_LINK}
        </lc-alert>
        <lc-alert variant="error" title="Senden gerade nicht möglich" message="Wir können Ihre Nachricht gerade nicht senden." actionsLayout="stacked">
          <lc-button slot="action" variant="outline" size="lg">Erneut senden</lc-button>
          ${CONTACT_LINK}
        </lc-alert>
      </div>`,
  }),
};

/** Root text size of a large-text story: `200%` is a phone set to large text (not browser zoom). */
type StoryTextSize = '200%' | '100%';
type LargeTextStory = StoryObj<AlertComponent & { textSize: StoryTextSize }>;

const textSizeArgType = {
  control: 'inline-radio',
  options: ['200%', '100%'],
  description:
    "Root font size of the canvas (`html { font-size }`), the way a phone's large-text setting raises it; every rem value doubles at `200%`. Story only, not a component input; the docs page stays at 100 %",
  table: { defaultValue: { summary: "'200%'" } },
} as const;

/** Raises the root text in the canvas only (`#storybook-root`), so the docs page keeps 100 %. */
const TEXT_SIZE_STYLE = `<style>::ng-deep html:has(#storybook-root [data-lc-story-text="200%"]) { font-size: 200%; }</style>`;

/** One 123 px box (the alert in `lc-next-step-card` `[slot='body']` at 320 px and 200 % text). */
const narrowBox = (lang = 'de', title = '', message = '') => `
  <div lang="${lang}" style="width: 123px;">
    <lc-alert variant="error" title="${title}" message="${message}" />
  </div>`;

/**
 * 3.13.1 (G-WL4): the reproduction from the life-os waitlist's DE 503 answer —
 * a 123 px alert at 200 % text. Below 16rem inside the border the alert uses
 * the narrow layout, and long words hyphenate (with `lang`) or break (without)
 * instead of leaving the box.
 */
export const NarrowContainer: LargeTextStory = {
  name: 'Narrow Container at 200 % Text (G-WL4)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  parameters: {
    docs: {
      description: {
        story:
          "3.13.1 (G-WL4): three 123 px boxes, as the alert sits in `lc-next-step-card` `[slot='body']` at 320 px and 200 % text on the life-os waitlist's 503 answer: German (`lang=\"de\"`), English (`lang=\"en\"`) and the German text without a language (`lang=\"\"`). When the space inside the alert's border is below 16rem (alerts under 258 px at 100 % text, 514 px at 200 %), the alert switches to a narrow layout (TD-1). There, long words hyphenate with `hyphens: auto`, which needs the page's `lang` (for example `<html lang=\"de\">`). Without a `lang`, a word wider than the line still breaks, without a hyphen, so no text leaves the alert. Open it in the canvas at 320 or 360 px.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize" style="display: flex; flex-direction: column; gap: 16px;">
        ${narrowBox('de', 'Nicht eingetragen', 'Wir haben nichts gespeichert. Versuch es später noch einmal.')}
        ${narrowBox('en', 'Not registered', 'We kept nothing. Please try again later.')}
        ${narrowBox('', 'Nicht eingetragen', 'Wir haben nichts gespeichert. Versuch es später noch einmal.')}
      </div>
      ${TEXT_SIZE_STYLE}`,
  }),
};

/**
 * 3.13.1 (G-WL4): the narrow layout on a phone at 200 % text with every
 * optional part — dismiss button, inline button, text link, stacked actions
 * and no title. At 100 % text the same alerts show the wide layout.
 */
export const NarrowLayout: LargeTextStory = {
  name: 'Narrow Layout (phone at 200 % text)',
  args: { textSize: '200%' },
  argTypes: { textSize: textSizeArgType },
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.13.1 (G-WL4): at 200 % text a phone alert is below 16rem inside its border, so it uses the narrow layout: the icon shares the first row with the title (the title moves below the icon when its longest word does not fit beside it), the × stays at the end of that row, message and actions take the full width below, starting at the inner edge, and the padding is one density step smaller. DOM and focus order are unchanged. Plain, dismissible, an inline button, a text link, stacked actions and an alert without a title, in German. Switch `textSize` to `100%` to see the unchanged wide layout. Open it in the canvas at 320 or 360 px.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div [attr.data-lc-story-text]="textSize" lang="de" style="display: flex; flex-direction: column; gap: 16px;">
        <lc-alert variant="error" title="Nicht eingetragen" message="Wir haben nichts gespeichert. Versuch es später noch einmal." />
        <lc-alert variant="info" title="Benachrichtigungseinstellungen gespeichert" message="Sie gelten ab sofort auf allen Geräten." [dismissible]="true" closeAriaLabel="Hinweis schließen" />
        <lc-alert variant="error" title="Laden fehlgeschlagen" message="Die Vorhaben-Liste konnte nicht geladen werden.">
          <lc-button slot="action" variant="outline" size="sm">Erneut versuchen</lc-button>
        </lc-alert>
        <lc-alert variant="error" title="Senden gerade nicht möglich" message="Wir können Ihre Nachricht gerade nicht senden.">
          ${CONTACT_LINK}
        </lc-alert>
        <lc-alert variant="warning" title="Du hast nur einen Passkey" message="Ohne einen zweiten kommst du nicht mehr in dein Konto, wenn dieses Gerät fehlt." iconAriaLabel="Warnung" actionsLayout="stacked">
          <lc-button slot="action" variant="outline" size="lg">Zweiten Passkey einrichten</lc-button>
          <lc-button slot="action" variant="ghost" size="lg">Später</lc-button>
        </lc-alert>
        <lc-alert variant="success" message="Ihre Änderungen wurden gespeichert." />
      </div>
      ${TEXT_SIZE_STYLE}`,
  }),
};

/** The first alert of the side column, in a box of the given width (the threshold). */
const thresholdBox = (width = '257px') => `
  <div style="width: ${width};">
    <lc-alert variant="info" title="Export ready" message="Your CSV file is ready to download." />
  </div>`;

/**
 * 3.13.1 (G-WL4): the narrow layout at 100 % text in a 240 px side column,
 * then the threshold: a 257 px alert (narrow) and a 258 px alert (wide).
 */
export const NarrowColumn: Story = {
  name: 'Narrow Layout in a Side Column (100 % text)',
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.13.1 (G-WL4): a 240 px side column at 100 % text — alerts under 258 px use the narrow layout at any text size. Then the threshold: the same alert at 257 px (narrow, 12 px padding) and at 258 px (wide, 16 px padding, as before 3.13.1).',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="en" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="width: 240px; display: flex; flex-direction: column; gap: 16px;">
          <lc-alert variant="info" title="Export ready" message="Your CSV file is ready to download." />
          <lc-alert variant="warning" title="Storage almost full" message="You have used 90% of your quota." [dismissible]="true" />
          <lc-alert variant="error" title="Connection failed" message="Unable to reach the server.">
            <lc-button slot="action" variant="outline" size="sm">Retry</lc-button>
          </lc-alert>
          <lc-alert variant="success" message="Your changes have been saved." />
        </div>
        ${thresholdBox('257px')}
        ${thresholdBox('258px')}
      </div>`,
  }),
};

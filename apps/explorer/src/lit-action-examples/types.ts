export interface LitActionExample {
  /**
   * Unique identifier used for lookups and navigation.
   */
  id: string;
  /**
   * Human friendly title displayed in the UI.
   */
  title: string;
  /**
   * Short description to help users understand what the example does.
   */
  description?: string;
  /**
   * JavaScript code that will populate the Monaco editor.
   */
  code: string;
  /**
   * Optional order override. Lower numbers appear first.
   */
  order?: number;
  /**
   * Lightweight tagging for future filtering or search.
   */
  tags?: string[];
  /**
   * Optional default parameters to merge into the example execution.
   */
  jsParams?: Record<string, unknown>;
}

export interface LitActionExampleModule {
  default: LitActionExample;
}

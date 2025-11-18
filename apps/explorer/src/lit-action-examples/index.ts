import type {
  LitActionExample,
  LitActionExampleModule,
} from "./types";

const modules = import.meta.glob<LitActionExampleModule>(
  "./entries/**/*.ts",
  { eager: true }
);

const dedupe = new Map<string, LitActionExample>();

for (const mod of Object.values(modules)) {
  const example = mod?.default;
  if (!example) continue;

  if (dedupe.has(example.id)) {
    // Later files override earlier ones to make local iteration easier.
    console.warn(
      `[lit-action-examples] Duplicate example id detected: ${example.id}. ` +
        "Overriding with the most recently evaluated module."
    );
  }

  dedupe.set(example.id, {
    ...example,
    // Normalise code to always be a string (helps when snippets accidentally export undefined).
    code: example.code ?? "",
  });
}

const examples = Array.from(dedupe.values()).sort((a, b) => {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return a.title.localeCompare(b.title);
});

const exampleMap = new Map(examples.map((example) => [example.id, example]));

export const litActionExamples = examples;

export function getLitActionExample(id: string): LitActionExample | undefined {
  return exampleMap.get(id);
}

export function getDefaultLitActionExample(): LitActionExample | undefined {
  return examples[0];
}

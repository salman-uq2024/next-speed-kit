import type { Transform } from 'jscodeshift';

export interface CodemodDefinition {
  name: string;
  summary: string;
  description: string;
  tags: string[];
  filePatterns: string[];
  transform: Transform;
}

export type CodemodName = CodemodDefinition['name'];

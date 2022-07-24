export interface ZipArtifact {
  path: string;
  name: string;
  type: 'file' | 'directory';
  shouldIgnore?: (fileName: string) => boolean;
}

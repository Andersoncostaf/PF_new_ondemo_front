declare module 'quill' {
  // Quill não publica tipos oficiais nesta versão do projeto.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Quill: any;
  export default Quill;
  export type Quill = any;
}

declare module "transform-markdown-links" {

  export default function  (input: string, transform: (link: string, text: string) => string|null): string

}
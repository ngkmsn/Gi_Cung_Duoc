// TypeScript type declarations for CSS and CSS Modules imports

declare module '*.module.css' {
  const styles: { readonly [key: string]: string };
  export default styles;
}

declare module '*.css';

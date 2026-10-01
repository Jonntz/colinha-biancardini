/** Marca elementos que aparecem na tela mas não entram na imagem baixada. */
export const EXPORT_IGNORE_ATTRIBUTE = "data-export-ignore";

/** Espalhe em elementos JSX: `<input {...exportIgnoreProps} />`. */
export const exportIgnoreProps = { [EXPORT_IGNORE_ATTRIBUTE]: "" } as const;

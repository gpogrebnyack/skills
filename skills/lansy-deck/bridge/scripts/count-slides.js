// Read-only: how many slides the open file has and what it is.
// getSlideGrid keeps slides removed in this session (removed: true) until the file reloads.
return { editorType: figma.editorType, slides: figma.editorType === 'slides' ? figma.getSlideGrid().flat().filter((s) => !s.removed).length : null };

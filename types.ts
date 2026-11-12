export type Scene = { sceneNumber:number; title:string; visualDescription:string; imagePrompt:string; videoPrompt:string; dialogue:string; narration:string };
export type StoryResult = { title:string; summary:string; characters:{name:string;description:string;voice:string}[]; scenes:Scene[] };

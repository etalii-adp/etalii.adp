/* Example data: the sections of each portal page. */
export type BlockName = 'nav' | 'hero' | 'cards' | 'map' | 'chart' | 'form' | 'table' | 'footer' | 'title' | 'drop';

export const PAGE:Record<string,BlockName[]>={'Home':['nav','hero','cards','footer'],'Outage map':['nav','title','map','table','footer'],'My usage':['nav','title','chart','cards','footer'],'Report an outage':['nav','title','form','footer'],'Admin console':['nav','title','table','footer'],'Sign-in page':['title','form']};

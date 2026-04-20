export type Ferragem = {
  id: number;
  name: string;
  bairro: string;
  owner: string | null;
  created?: string;
};

export type FerragemCreate = {
  name: string;
  bairro: string;
  ownerId?: number;
};

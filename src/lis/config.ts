export interface Config {
  baseUrl: string;
}

export const config: Config = {
  baseUrl: process.env.BASE_URL || 'https://lis.parliament.go.th/index/'
};
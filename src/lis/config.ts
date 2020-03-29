export interface Config {
  lisBaseUrl: string;
}

export const config: Config = {
  lisBaseUrl: process.env.BASE_URL || 'https://lis.parliament.go.th/index/'
};
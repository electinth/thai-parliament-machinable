import search from './parliament-lis';


const option = new search.Option();
option.sapaNo = 25;
option.system = search.System.Motion;
search.getJson(option);
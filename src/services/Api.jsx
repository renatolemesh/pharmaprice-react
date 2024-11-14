export const BASE_URL = 'http://200.142.147.154:8002/api';

const fetchData = async (endpoint, queryParams) => {
  const apiUrl = new URL(`${BASE_URL}/${endpoint}`);
  Object.keys(queryParams).forEach(key => apiUrl.searchParams.append(key, queryParams[key]));

  try {
    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Error('Erro ao buscar dados da API');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

export const fetchPrecos = async (searchFilters, currentPage) => {
  const { query, searchType } = searchFilters;
  const queryParams = {
    page: currentPage,
    ...(query && { [searchType]: query })
  };

  try {
    const { data: resultsData, last_page: totalPages } = await fetchData('precos', queryParams);
    return { resultsData, totalPages };
  } catch (error) {
    throw error;
  }
};

export const fetchPriceHistory = async (query, searchType, startDate, endDate, selectedPharmacy, page = 1) => {
  const queryParams = {
    page,
    ...(query && { [searchType]: query }),
    ...(startDate && { 'data-inicio': startDate }),
    ...(endDate && { 'data-fim': endDate }),
    ...(selectedPharmacy && { farmacia: selectedPharmacy })
  };

  try {
    return await fetchData('precos/historico', queryParams);
  } catch (error) {
    throw error;
  }
};

export const fetchReportData = async (filters, page = 1) => {
  const { priceType, startDate, endDate, selectedPharmacies } = filters;
  const endpoint = priceType === 'historical' ? 'precos/historico' : 'precos';
  const queryParams = {
    page,
    ...(startDate && { 'data-inicio': startDate }),
    ...(endDate && { 'data-fim': endDate }),
    ...(selectedPharmacies.length > 0 && { farmacia: selectedPharmacies.join('+') })
  };

  try {
    return await fetchData(endpoint, queryParams);
  } catch (error) {
    throw error;
  }
};

export const exportReportData = async (filters) => {
  const { priceType, startDate, endDate, selectedPharmacies } = filters;
  const endpoint = priceType === 'historical' ? 'precos/historico' : 'precos';
  const queryParams = {
    no_paginate: true,
    ...(startDate && { 'data-inicio': startDate }),
    ...(endDate && { 'data-fim': endDate }),
    ...(selectedPharmacies.length > 0 && { farmacia: selectedPharmacies.join('+') })
  };

  try {
    return await fetchData(endpoint, queryParams);
  } catch (error) {
    throw error;
  }
};

// New function for fetching descriptions
export const fetchDescriptions = async (query) => {
  const queryParams = { descricao: query }; // Adjust as per your API requirements

  try {
    const data = await fetchData('descricoes', queryParams);
    return data; // Assuming the API returns an array of descriptions
  } catch (error) {
    throw error;
  }
};

export const fetchFilteredDescriptions = async (query) => {
  const queryParams = { descricao: query };

  try {
    const data = await fetchData('descricoes', queryParams);
    return data; // Supondo que a API retorna um array de descrições
  } catch (error) {
    throw error;
  }
};

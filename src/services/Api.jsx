export const BASE_URL = 'https://api.pharmaprices.shop/api';

const fetchData = async (endpoint, queryParams = {}) => {
  const apiUrl = new URL(`${BASE_URL}/${endpoint}`);
  Object.keys(queryParams).forEach(key => apiUrl.searchParams.append(key, queryParams[key]));

  try {
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      const errorData = await response.json(); // Captura a resposta de erro
      console.error('Erro na requisição:', errorData);
      throw new Error(`Erro ao buscar dados da API: ${errorData.message || 'Erro desconhecido'}`);
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
   const { data: resultsData, last_page: totalPages } = await fetchData('precos', queryParams);
    return { resultsData, totalPages };
};

export const fetchPriceHistory = async (query, searchType, startDate, endDate, selectedPharmacy, page = 1) => {
  const queryParams = {
    page,
    ...(query && { [searchType]: query }),
    ...(startDate && { 'data-inicio': startDate }),
    ...(endDate && { 'data-fim': endDate }),
    ...(selectedPharmacy && { farmacia: selectedPharmacy })
  };

    return await fetchData('precos/historico', queryParams);
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

    return await fetchData(endpoint, queryParams);

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

    return await fetchData(endpoint, queryParams);

};

// New function for fetching descriptions
export const fetchDescriptions = async (query) => {
  const queryParams = { descricao: query }; // Adjust as per your API requirements
    const data = await fetchData('descricoes', queryParams);
    return data; // Assuming the API returns an array of descriptions
};

export const fetchFilteredDescriptions = async (query) => {
  const queryParams = { descricao: query };
  const data = await fetchData('descricoes', queryParams);
  return data; // Supondo que a API retorna um array de descrições

};

export const fetchTrendsData = async () => {
    return await fetchData('dashboard/trends');

};

export const fetchStatistics = async () => {
    return await fetchData('dashboard/statistics');
};

export const fetchTopProductsChanges = async () => {
  return await fetchData('dashboard/top-changes');
}

export const fetchPharmacyStats = async () => {
  return await fetchData('dashboard/pharmacy-stats');
}

export const fetchDashboardSummary = async () => {
  return await fetchData('dashboard/summary');
};

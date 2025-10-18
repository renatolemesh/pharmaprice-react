export const formatNumberToBRL = (number) => {
  const parsed = Number(number);

  if (isNaN(parsed)) {
    return '-';
  }

  return parsed.toLocaleString('pt-BR');
};

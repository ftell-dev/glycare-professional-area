export function cleanCpf(value = '') {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function isValidCpf(value = '') {
  const cpf = cleanCpf(value)

  if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false

  const calculateDigit = (length) => {
    let sum = 0

    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index)
    }

    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10])
}

export function formatCpf(value = '') {
  const cpf = cleanCpf(value)
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function calcularIdade(dataNascimento: string): number | null {
    if (!dataNascimento) return null;

    const partes = dataNascimento.split('/');

    if (partes.length !== 3) return null;

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    const nascimento = new Date(ano, mes - 1, dia);

    if (
        !Number.isInteger(dia) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(ano) ||
        ano < 1900 ||
        nascimento.getFullYear() !== ano ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getDate() !== dia
    ) {
        return null;
    }

    const hoje = new Date();

    if (nascimento > hoje) return null;

    let idade = hoje.getFullYear() - ano;

    if (
        hoje.getMonth() < mes - 1 ||
        (hoje.getMonth() === mes - 1 && hoje.getDate() < dia)
    ) {
        idade--;
    }

    return idade;
}

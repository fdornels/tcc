import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';

export default function VincularProfissional() {
    const [codigo, setCodigo] = useState('');
const [gerando, setGerando] = useState(false);
type Solicitacao = {
    id: string;
    nomeProfissional: string;
    status: string;
};

const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
const [carregandoSolicitacoes, setCarregandoSolicitacoes] = useState(false);
type ProfissionalVinculado = {
    solicitacaoId: string;
    nome: string;
};

const [profissionais, setProfissionais] = useState<ProfissionalVinculado[]>([]);
const [carregandoProfissionais, setCarregandoProfissionais] = useState(false);
const carregarSolicitacoes = useCallback(async () => {
    try {
        setCarregandoSolicitacoes(true);

        const usuario = auth.currentUser;
        if (!usuario) return;

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/solicitacoes',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || 'Erro ao buscar solicitações.'
            );
        }

        setSolicitacoes(dados.solicitacoes || []);
    } catch (erro) {
        console.log('Erro ao carregar solicitações:', erro);
    } finally {
        setCarregandoSolicitacoes(false);
    }
}, []);
const carregarProfissionais = useCallback(async () => {
    try {
        setCarregandoProfissionais(true);

        const usuario = auth.currentUser;
        if (!usuario) return;

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/aprovados',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || 'Erro ao carregar profissionais.'
            );
        }

        setProfissionais(dados.profissionais || []);
    } catch (erro) {
        console.log('Erro ao carregar profissionais:', erro);
    } finally {
        setCarregandoProfissionais(false);
    }
}, []);
useFocusEffect(
    useCallback(() => {
        void carregarSolicitacoes();
        void carregarProfissionais();
    }, [carregarSolicitacoes, carregarProfissionais])
);
async function responderSolicitacao(
    solicitacaoId: string,
    decisao: 'aprovar' | 'recusar'
) {
    try {
        const usuario = auth.currentUser;

        if (!usuario) {
            alert('Faça login para continuar.');
            return;
        }

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/responder',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    solicitacaoId,
                    decisao,
                }),
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao responder.');
        }

        alert(
            decisao === 'aprovar'
                ? 'Profissional aprovado!'
                : 'Solicitação recusada.'
        );

        await carregarSolicitacoes();
    } catch (erro: any) {
        alert(erro.message || 'Não foi possível responder.');
    }
}
async function revogarAcesso(solicitacaoId: string) {
    try {
        const usuario = auth.currentUser;

        if (!usuario) {
            alert('Faça login para continuar.');
            return;
        }

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/revogar',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ solicitacaoId }),
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || 'Não foi possível revogar o acesso.'
            );
        }

        alert('Acesso revogado com sucesso!');
        await carregarProfissionais();
    } catch (erro: any) {
        alert(erro.message || 'Erro ao revogar acesso.');
    }
}
async function gerarCodigo() {
    if (gerando) return;

    try {
        setGerando(true);

        const usuario = auth.currentUser;

        if (!usuario) {
            alert('Você precisa estar conectada.');
            return;
        }

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/gerar-codigo',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao gerar código.');
        }

        setCodigo(dados.codigo);
    } catch (erro: any) {
        alert(erro.message || 'Não foi possível gerar o código.');
    } finally {
        setGerando(false);
    }
}
    return (
        <SafeAreaView style={styles.container}>
            <Ionicons
                name="people-outline"
                size={48}
                color="#42A5D5"
            />

            <Text style={styles.titulo}>
                Vincular profissional
            </Text>

            <Text style={styles.descricao}>
                Aqui você poderá gerar um código para
                vincular um profissional à criança.
            </Text>
            <Pressable
    style={styles.botaoGerar}
    onPress={gerarCodigo}
    disabled={gerando}
>
    <Text style={styles.textoBotao}>
        {gerando ? 'Gerando...' : 'Gerar código'}
    </Text>
</Pressable>

{codigo !== '' && (
    <View style={styles.cardCodigo}>
        <Text style={styles.labelCodigo}>
            Seu código de vinculação
        </Text>

        <Text style={styles.codigo}>
            {codigo}
        </Text>

        <Text style={styles.validade}>
            Válido por 15 minutos
        </Text>
    </View>
)}

            <View style={styles.secaoSolicitacoes}>
    <Text style={styles.tituloSecao}>
        Solicitações pendentes
    </Text>

    {carregandoSolicitacoes ? (
        <Text style={styles.mensagemSolicitacoes}>
            Carregando solicitações...
        </Text>
    ) : solicitacoes.length === 0 ? (
        <Text style={styles.mensagemSolicitacoes}>
            Nenhuma solicitação pendente.
        </Text>
    ) : (
        solicitacoes.map((solicitacao) => (
            <View
                key={solicitacao.id}
                style={styles.cardSolicitacao}
            >
                <Ionicons
                    name="person-circle-outline"
                    size={30}
                    color="#42A5D5"
                />

                <Text style={styles.nomeProfissional}>
                    {solicitacao.nomeProfissional}
                </Text>

                <Text style={styles.statusSolicitacao}>
                    Aguardando sua autorização
                </Text>
                <View style={styles.acoesSolicitacao}>
    <Pressable
        style={styles.botaoAprovar}
        onPress={() =>
            responderSolicitacao(solicitacao.id, 'aprovar')
        }
    >
        <Text style={styles.textoAcao}>
            Aprovar
        </Text>
    </Pressable>

    <Pressable
        style={styles.botaoRecusar}
        onPress={() =>
            responderSolicitacao(solicitacao.id, 'recusar')
        }
    >
        <Text style={styles.textoRecusar}>
            Recusar
        </Text>
    </Pressable>
</View>
            </View>
        ))
    )}
</View>
<View style={styles.secaoSolicitacoes}>
    <Text style={styles.tituloSecao}>
        Profissionais autorizados
    </Text>

    {carregandoProfissionais ? (
        <Text style={styles.mensagemSolicitacoes}>
            Carregando profissionais...
        </Text>
    ) : profissionais.length === 0 ? (
        <Text style={styles.mensagemSolicitacoes}>
            Nenhum profissional vinculado.
        </Text>
    ) : (
        profissionais.map((profissional) => (
            <View
                key={profissional.solicitacaoId}
                style={styles.cardSolicitacao}
            >
                <Ionicons
                    name="shield-checkmark-outline"
                    size={30}
                    color="#42A5D5"
                />

                <Text style={styles.nomeProfissional}>
                    {profissional.nome}
                </Text>

                <Text style={styles.statusSolicitacao}>
                    Acesso autorizado pelo responsável
                </Text>
                <Pressable
    style={styles.botaoRecusar}
    onPress={() =>
        Alert.alert(
            'Revogar acesso',
            'Esse profissional perderá o acesso ao perfil e ao diário da criança. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Revogar',
                    style: 'destructive',
                    onPress: () =>
                        revogarAcesso(profissional.solicitacaoId),
                },
            ]
        )
    }
>
    <Text style={styles.textoRecusar}>
        Revogar acesso
    </Text>
</Pressable>
            </View>
        ))
    )}
</View><Text
                style={styles.voltar}
                onPress={() => router.back()}
            >
                Voltar
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    botaoGerar: {
    backgroundColor: '#42A5D5',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 15,
    marginTop: 25,
},

textoBotao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
},

cardCodigo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
},

labelCodigo: {
    fontSize: 12,
    color: '#8196A3',
},

codigo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#30475D',
    letterSpacing: 3,
    marginTop: 12,
},

validade: {
    fontSize: 11,
    color: '#E46B98',
    marginTop: 10,
},
    secaoSolicitacoes: {
    width: '100%',
    marginTop: 25,
},

tituloSecao: {
    fontSize: 17,
    fontWeight: '700',
    color: '#30475D',
    marginBottom: 12,
},

mensagemSolicitacoes: {
    fontSize: 13,
    color: '#8196A3',
    textAlign: 'center',
    marginVertical: 15,
},

cardSolicitacao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
},

nomeProfissional: {
    fontSize: 15,
    fontWeight: '700',
    color: '#30475D',
    marginTop: 8,
},

statusSolicitacao: {
    fontSize: 12,
    color: '#8196A3',
    marginTop: 5,
},
acoesSolicitacao: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    width: '100%',
},

botaoAprovar: {
    flex: 1,
    backgroundColor: '#42A5D5',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
},

botaoRecusar: {
    flex: 1,
    backgroundColor: '#FFF0F4',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
},

textoAcao: {
    color: '#FFFFFF',
    fontWeight: '700',
},

textoRecusar: {
    color: '#E46B98',
    fontWeight: '700',
},
container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
    },
    titulo: {
        fontSize: 22,
        fontWeight: '700',
        color: '#30475D',
        marginTop: 20,
    },
    descricao: {
        fontSize: 13,
        color: '#8196A3',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 21,
    },
    voltar: {
        color: '#E46B98',
        fontWeight: '700',
        marginTop: 30,
    },
});
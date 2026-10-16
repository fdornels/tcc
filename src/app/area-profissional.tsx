import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth } from '../../config/firebase';
export default function AreaProfissional() {
    type CriancaVinculada = {
    responsavelUid: string;
    nome: string;
};

const [criancas, setCriancas] = useState<CriancaVinculada[]>([]);
const [carregando, setCarregando] = useState(false);
const carregarCriancas = useCallback(async () => {
    try {
        setCarregando(true);

        const usuario = auth.currentUser;
        if (!usuario) return;

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/profissional/vinculos',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao carregar crianças.');
        }

        setCriancas(dados.criancas || []);
    } catch (erro) {
        console.log('Erro ao carregar crianças:', erro);
    } finally {
        setCarregando(false);
    }
}, []);

useFocusEffect(
    useCallback(() => {
        void carregarCriancas();
    }, [carregarCriancas])
);
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.conteudo}>
                <View style={styles.cabecalho}>
                    <Text style={styles.titulo}>
                        Área Profissional
                    </Text>

                    <Text style={styles.subtitulo}>
                        Acompanhando cada conquista com cuidado
                    </Text>
                </View>

                <View style={styles.cardBoasVindas}>
                    <Ionicons
                        name="medkit-outline"
                        size={32}
                        color="#42A5D5"
                    />

                    <Text style={styles.tituloCard}>
                        Bem-vindo ao (TE)Ajudo!
                    </Text>

                    <Text style={styles.descricao}>
                        Aqui você poderá acompanhar as crianças
                        vinculadas ao seu perfil, consultar seus
                        diários e conhecer suas necessidades.
                    </Text>
                </View>

                <Text style={styles.secao}>
                    Crianças acompanhadas
                </Text>

                {carregando ? (
    <Text style={styles.textoVazio}>
        Carregando crianças...
    </Text>
) : criancas.length === 0 ? (
    <View style={styles.cardVazio}>
        <Ionicons
            name="people-outline"
            size={42}
            color="#8BCBE8"
        />

        <Text style={styles.tituloVazio}>
            Nenhuma criança vinculada
        </Text>

        <Text style={styles.textoVazio}>
            Para começar, solicite à família
            um código de vinculação.
        </Text>
    </View>
) : (
    criancas.map((crianca) => (
        <View
            key={crianca.responsavelUid}
            style={styles.cardVazio}
        >
            <Ionicons
                name="person-circle-outline"
                size={42}
                color="#42A5D5"
            />

            <Text style={styles.tituloVazio}>
                {crianca.nome}
            </Text>

            <Text style={styles.textoVazio}>
                Acompanhamento autorizado pela família
            </Text>
        </View>
    ))
)}
                <TouchableOpacity
                    style={styles.botaoVincular}
                    onPress={() => router.push('/solicitar-vinculo')}
                >
                    <Ionicons
                        name="link-outline"
                        size={20}
                        color="#FFFFFF"
                    />

                    <Text style={styles.textoBotao}>
                        Vincular criança
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoVoltar}
                    onPress={() => router.replace('/login')}
                >
                    <Text style={styles.textoVoltar}>
                        Voltar para o login
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
    },

    conteudo: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 45,
    },

    cabecalho: {
        marginBottom: 28,
    },

    titulo: {
        fontSize: 26,
        fontWeight: '800',
        color: '#30475D',
    },

    subtitulo: {
        fontSize: 13,
        color: '#8196A3',
        marginTop: 8,
    },

    cardBoasVindas: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8F1F5',
        marginBottom: 28,
    },

    tituloCard: {
        fontSize: 18,
        fontWeight: '700',
        color: '#30475D',
        marginTop: 12,
        marginBottom: 10,
    },

    descricao: {
        fontSize: 13,
        color: '#8196A3',
        textAlign: 'center',
        lineHeight: 21,
    },

    secao: {
        fontSize: 17,
        fontWeight: '700',
        color: '#30475D',
        marginBottom: 14,
    },

    cardVazio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8F1F5',
    },

    tituloVazio: {
        fontSize: 16,
        fontWeight: '700',
        color: '#30475D',
        marginTop: 14,
    },

    textoVazio: {
        fontSize: 12,
        color: '#8196A3',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 19,
    },

    botaoVincular: {
        backgroundColor: '#42A5D5',
        borderRadius: 15,
        padding: 16,
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    botaoVoltar: {
        alignItems: 'center',
        marginTop: 25,
    },

    textoVoltar: {
        color: '#E46B98',
        fontSize: 13,
        fontWeight: '600',
    },
});
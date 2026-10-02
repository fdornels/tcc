import { router, useFocusEffect } from 'expo-router';
import {
    collectionGroup,
    getDocs,
} from 'firebase/firestore';
import {
    useCallback,
    useState,
} from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../../config/firebase';

type Crianca = {
    id: string;
    nome: string;
    apelido?: string;
    dataNascimento?: string;
    sexo?: string;
    escola?: string;
    comunicacao?: string;
    preferencias?: string;
    sensibilidades?: string;
    observacoes?: string;
};

export default function AdminCriancasScreen() {
    const [criancas, setCriancas] = useState<Crianca[]>([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);

    async function carregarCriancas() {
        try {
            setCarregando(true);

            const referencia = collectionGroup(db, 'crianca');
            const resultado = await getDocs(referencia);

            const lista: Crianca[] = resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<Crianca, 'id'>),
                })
            );

            lista.sort((a, b) =>
                (a.nome ?? '').localeCompare(b.nome ?? '')
            );

            setCriancas(lista);
        } catch (erro) {
            console.log('ERRO ADMIN CRIANCAS:', erro);

            Alert.alert(
                'Erro ao carregar crianças',
                String(erro)
            );
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarCriancas();
        }, [])
    );

    const criancasFiltradas = criancas.filter((crianca) =>
        (crianca.nome ?? '')
            .toLowerCase()
            .includes(busca.trim().toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >
                {/* CABEÇALHO */}
                <View style={styles.cabecalho}>
                    <Pressable
                        style={styles.botaoVoltar}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.titulo}>
                        Crianças cadastradas
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* APRESENTAÇÃO */}
                <View style={styles.apresentacao}>
                    <Text style={styles.emojiApresentacao}>
                        👶
                    </Text>

                    <View style={styles.textoApresentacao}>
                        <Text style={styles.tituloApresentacao}>
                            Crianças no TEAjudo
                        </Text>

                        <Text style={styles.subtituloApresentacao}>
                            Consulte as crianças cadastradas pelos
                            responsáveis.
                        </Text>
                    </View>
                </View>

                {/* BUSCA */}
                <View style={styles.campoBusca}>
                    <Text style={styles.lupa}>⌕</Text>

                    <TextInput
                        style={styles.inputBusca}
                        placeholder="Buscar criança pelo nome..."
                        placeholderTextColor="#8B979C"
                        value={busca}
                        onChangeText={setBusca}
                    />
                </View>

                <Text style={styles.quantidade}>
                    {criancas.length}{' '}
                    {criancas.length === 1
                        ? 'criança cadastrada'
                        : 'crianças cadastradas'}
                </Text>

                {/* LISTA */}
                {carregando ? (
                    <View style={styles.estado}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.textoEstado}>
                            Carregando crianças...
                        </Text>
                    </View>
                ) : criancasFiltradas.length === 0 ? (
                    <View style={styles.estado}>
                        <Text style={styles.emojiVazio}>🧸</Text>

                        <Text style={styles.tituloVazio}>
                            {busca
                                ? 'Nenhuma criança encontrada'
                                : 'Nenhuma criança cadastrada'}
                        </Text>

                        <Text style={styles.textoEstado}>
                            {busca
                                ? 'Tente pesquisar outro nome.'
                                : 'As crianças cadastradas aparecerão aqui.'}
                        </Text>
                    </View>
                ) : (
                    criancasFiltradas.map((crianca) => (
                        <Pressable
                            key={crianca.id}
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: '/admin-crianca-detalhes',
                                    params: {
                                        nome: crianca.nome ?? '',
                                        apelido: crianca.apelido ?? '',
                                        dataNascimento: crianca.dataNascimento ?? '',
                                        sexo: crianca.sexo ?? '',
                                        escola: crianca.escola ?? '',
                                        comunicacao: crianca.comunicacao ?? '',
                                        preferencias: crianca.preferencias ?? '',
                                        sensibilidades: crianca.sensibilidades ?? '',
                                        observacoes: crianca.observacoes ?? '',
                                    },
                                })
                            }
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarEmoji}>🧸</Text>
                            </View>

                            <View style={styles.info}>
                                <Text style={styles.nome}>
                                    {crianca.nome || 'Sem nome'}
                                </Text>

                                {crianca.apelido ? (
                                    <Text style={styles.detalhe}>
                                        💙 {crianca.apelido}
                                    </Text>
                                ) : null}

                                {crianca.dataNascimento ? (
                                    <Text style={styles.detalhe}>
                                        🎂 {crianca.dataNascimento}
                                    </Text>
                                ) : null}

                                {crianca.escola ? (
                                    <Text style={styles.detalhe}>
                                        🎒 {crianca.escola}
                                    </Text>
                                ) : null}
                            </View>
                        </Pressable>
                    ))
                )}
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF5FC',
    },

    conteudo: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    cabecalho: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    botaoVoltar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    seta: {
        fontSize: 30,
        color: '#4DA4CF',
        marginTop: -4,
    },

    titulo: {
        fontSize: 19,
        fontWeight: '700',
        color: '#4B5A60',
    },

    estrela: {
        fontSize: 26,
        color: '#F6C945',
    },

    apresentacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    emojiApresentacao: {
        fontSize: 35,
        marginRight: 14,
    },

    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 4,
    },

    subtituloApresentacao: {
        fontSize: 12,
        color: '#8B979C',
        lineHeight: 18,
    },

    campoBusca: {
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 12,
    },

    lupa: {
        fontSize: 22,
        color: '#4DA4CF',
        marginRight: 8,
    },

    inputBusca: {
        flex: 1,
        fontSize: 14,
        color: '#4B5A60',
    },

    quantidade: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64757C',
        marginBottom: 12,
        marginLeft: 4,
    },

    estado: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
    },

    emojiVazio: {
        fontSize: 38,
        marginBottom: 12,
    },

    tituloVazio: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 6,
        textAlign: 'center',
    },

    textoEstado: {
        fontSize: 12,
        color: '#8B979C',
        textAlign: 'center',
        marginTop: 8,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#EAF8FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    avatarEmoji: {
        fontSize: 29,
    },

    info: {
        flex: 1,
    },

    nome: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 5,
    },

    detalhe: {
        fontSize: 12,
        color: '#718087',
        marginTop: 3,
    },
});
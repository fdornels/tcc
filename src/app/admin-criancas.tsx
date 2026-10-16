import { Ionicons } from '@expo/vector-icons';
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
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../../config/firebase';
import { calcularIdade } from '../utils/calcularIdade';

type Crianca = {
    responsavelId?: string;
    id: string;
    nome: string;
    fotoUrl?: string;
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
    ...documento.data(),
    id: documento.id,
    responsavelId: documento.ref.parent.parent?.parent?.id ?? '',
  } as Crianca)
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
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
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
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#42A5D5"
                        />
                    </Pressable>

                    <Text style={styles.titulo}>
                        Crianças cadastradas
                    </Text>

                    <View style={{ width: 40 }} />
                </View>

                {/* APRESENTAÇÃO */}
                <View style={styles.apresentacao}>
                    <View style={styles.iconeApresentacao}>
                        <Ionicons
                            name="people-outline"
                            size={26}
                            color="#42A5D5"
                        />
                    </View>

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
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#42A5D5"
                    />

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
                        <View style={styles.iconeVazio}>
                            <Ionicons
                                name="people-outline"
                                size={30}
                                color="#42A5D5"
                            />
                        </View>

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
                                        fotoUrl: crianca.fotoUrl ?? '',
                                        uid: crianca.responsavelId ?? '',
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
                                {crianca.fotoUrl ? (
                                    <Image
                                        source={{ uri: crianca.fotoUrl }}
                                        style={styles.fotoCrianca}
                                    />
                                ) : (
                                    <Ionicons
                                        name={
                                            crianca.sexo?.toLowerCase() === 'menino'
                                                ? 'male'
                                                : crianca.sexo?.toLowerCase() === 'menina'
                                                    ? 'female'
                                                    : 'person-outline'
                                        }
                                        size={25}
                                        color="#42A5D5"
                                    />
                                )}
                            </View>

                            <View style={styles.info}>
                                <Text style={styles.nome}>
                                    {crianca.nome || 'Sem nome'}
                                </Text>
{calcularIdade(crianca.dataNascimento ?? '') !== null && (
    <View style={styles.linhaDetalhe}>
        <Ionicons
            name="time-outline"
            size={14}
            color="#8B979C"
        />
        <Text style={styles.detalhe}>
            {calcularIdade(crianca.dataNascimento ?? '')} anos
        </Text>
    </View>
)}
                                {crianca.apelido ? (
                                    <View style={styles.linhaDetalhe}>
                                        <Ionicons
                                            name="person-outline"
                                            size={14}
                                            color="#8B979C"
                                        />
                                        <Text style={styles.detalhe}>
                                            {crianca.apelido}
                                        </Text>
                                    </View>
                                ) : null}
                                {crianca.dataNascimento ? (
                                    <View style={styles.linhaDetalhe}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={14}
                                            color="#8B979C"
                                        />
                                        <Text style={styles.detalhe}>
                                            {crianca.dataNascimento}
                                        </Text>
                                    </View>
                                ) : null}

                                {crianca.escola ? (
                                    <View style={styles.linhaDetalhe}>
                                        <Ionicons
                                            name="school-outline"
                                            size={14}
                                            color="#8B979C"
                                        />
                                        <Text style={styles.detalhe}>
                                            {crianca.escola}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={19}
                                color="#B2C0C5"
                            />
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
        backgroundColor: '#F9FCFD',
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



    titulo: {
        fontSize: 19,
        fontWeight: '700',
        color: '#4B5A60',
    },



    apresentacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
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



    inputBusca: {
        flex: 1,
        fontSize: 14,
        color: '#4B5A60',
        marginLeft: 10,
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
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8F0F2',
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    fotoCrianca: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
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
        marginTop: 0,
    },
    decoracaoFundo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },

    manchaRosaTopo: {
        position: 'absolute',
        width: 270,
        height: 210,
        borderRadius: 140,
        backgroundColor: '#FFE8F0',
        top: -105,
        left: -85,
        opacity: 0.85,
    },

    manchaAzulTopo: {
        position: 'absolute',
        width: 290,
        height: 210,
        borderRadius: 150,
        backgroundColor: '#E2F5FC',
        top: -115,
        right: -100,
        opacity: 0.9,
    },

    manchaRosaBaixo: {
        position: 'absolute',
        width: 350,
        height: 230,
        borderRadius: 180,
        backgroundColor: '#FFE5EE',
        bottom: -110,
        left: -130,
        opacity: 0.8,
    },

    manchaAzulBaixo: {
        position: 'absolute',
        width: 360,
        height: 230,
        borderRadius: 190,
        backgroundColor: '#DCF3FC',
        bottom: -120,
        right: -150,
        opacity: 0.85,
    },
    iconeApresentacao: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    linhaDetalhe: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    iconeVazio: {
        width: 58,
        height: 58,
        borderRadius: 20,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
});
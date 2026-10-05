import {
    doc,
    getDoc,
    updateDoc,
} from 'firebase/firestore';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

type Orientacao = {
    id: string;
    titulo: string;
    categoria: string;
    icone: string;
    introducao?: string;
    dicas?: string[];
    lembrete?: string;
};

const categorias = [
    {
        nome: 'Crise Sensorial',
        icone: '🧩',
    },
    {
        nome: 'Comunicação',
        icone: '💬',
    },
    {
        nome: 'Rotinas',
        icone: '🌈',
    },
    {
        nome: 'Direitos',
        icone: '⚖️',
    },
];

export default function EditarOrientacaoScreen() {
    const params = useLocalSearchParams();

    const id =
        typeof params.id === 'string'
            ? params.id
            : '';

    const [carregando, setCarregando] = useState(true);

    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [introducao, setIntroducao] = useState('');

    const [dica1, setDica1] = useState('');
    const [dica2, setDica2] = useState('');
    const [dica3, setDica3] = useState('');
    const [dica4, setDica4] = useState('');

    const [lembrete, setLembrete] = useState('');

    useEffect(() => {
        carregarOrientacao();
    }, [id]);

    async function carregarOrientacao() {
        try {
            if (!id) {
                Alert.alert(
                    'Erro',
                    'Não foi possível identificar a orientação.'
                );

                router.back();
                return;
            }

            const referencia = doc(
                db,
                'orientacoes',
                id
            );

            const documento = await getDoc(referencia);

            if (!documento.exists()) {
                Alert.alert(
                    'Erro',
                    'A orientação não foi encontrada.'
                );

                router.back();
                return;
            }

            const orientacao = {
                id: documento.id,
                ...documento.data(),
            } as Orientacao;

            setTitulo(orientacao.titulo ?? '');
            setCategoria(orientacao.categoria ?? '');
            setIntroducao(orientacao.introducao ?? '');

            setDica1(orientacao.dicas?.[0] ?? '');
            setDica2(orientacao.dicas?.[1] ?? '');
            setDica3(orientacao.dicas?.[2] ?? '');
            setDica4(orientacao.dicas?.[3] ?? '');

            setLembrete(orientacao.lembrete ?? '');

        } catch (erro) {
            console.log(
                'Erro ao carregar orientação:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar a orientação.'
            );
        } finally {
            setCarregando(false);
        }
    }
    function pegarIconeCategoria() {
        const categoriaSelecionada =
            categorias.find(
                (item) => item.nome === categoria
            );

        return categoriaSelecionada?.icone ?? '📚';
    }

    async function salvarAlteracoes() {
        if (!titulo.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Digite o título da orientação.'
            );
            return;
        }

        if (!categoria) {
            Alert.alert(
                'Campo obrigatório',
                'Selecione uma categoria.'
            );
            return;
        }

        if (!id) {
            Alert.alert(
                'Erro',
                'Não foi possível identificar a orientação.'
            );
            return;
        }

        try {
            const dicas = [
                dica1.trim(),
                dica2.trim(),
                dica3.trim(),
                dica4.trim(),
            ].filter((dica) => dica.length > 0);

            await updateDoc(
                doc(db, 'orientacoes', id),
                {
                    titulo: titulo.trim(),
                    categoria,
                    icone: pegarIconeCategoria(),
                    introducao: introducao.trim(),
                    dicas,
                    lembrete: lembrete.trim(),
                    atualizadoEm: new Date(),
                }
            );

            Alert.alert(
                'Alterações salvas! 💙',
                'A orientação foi atualizada com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/admin-orientacoes'),
                    },
                ]
            );

        } catch (erro) {
            console.log(
                'Erro ao editar orientação:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível salvar as alterações.'
            );
        }
    }
    if (carregando) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.carregando}>
                    <Text style={styles.carregandoEmoji}>
                        📚
                    </Text>

                    <Text style={styles.carregandoTexto}>
                        Carregando orientação...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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

                        <Text style={styles.tituloPagina}>
                            Editar orientação
                        </Text>

                        <View style={{ width: 36 }} />
                    </View>

                    {/* APRESENTAÇÃO */}

                    <View style={styles.apresentacao}>
                        <View style={styles.iconeApresentacao}>
                            <Ionicons
                                name="create-outline"
                                size={26}
                                color="#42A5D5"
                            />
                        </View>

                        <View style={styles.textoApresentacao}>
                            <Text style={styles.tituloApresentacao}>
                                Editar conteúdo
                            </Text>

                            <Text style={styles.subtituloApresentacao}>
                                Altere as informações da orientação.
                            </Text>
                        </View>
                    </View>

                    {/* FORMULÁRIO */}

                    <View style={styles.card}>
                        <Text style={styles.label}>
                            Título da orientação *
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Título da orientação"
                            placeholderTextColor="#A1AAAE"
                            value={titulo}
                            onChangeText={setTitulo}
                        />

                        <Text style={styles.label}>
                            Categoria *
                        </Text>

                        <View style={styles.gradeCategorias}>
                            {categorias.map((item) => {
                                const selecionada =
                                    categoria === item.nome;

                                return (
                                    <Pressable
                                        key={item.nome}
                                        style={[
                                            styles.categoria,
                                            selecionada &&
                                            styles.categoriaSelecionada,
                                        ]}
                                        onPress={() =>
                                            setCategoria(item.nome)
                                        }
                                    >
                                        <Ionicons
                                            name={
                                                item.nome === 'Crise Sensorial'
                                                    ? 'options-outline'
                                                    : item.nome === 'Comunicação'
                                                        ? 'chatbubbles-outline'
                                                        : item.nome === 'Rotinas'
                                                            ? 'time-outline'
                                                            : 'document-text-outline'
                                            }
                                            size={23}
                                            color={selecionada ? '#FF7FA3' : '#42A5D5'}
                                        />

                                        <Text
                                            style={[
                                                styles.textoCategoria,
                                                selecionada &&
                                                styles.textoCategoriaSelecionada,
                                            ]}
                                        >
                                            {item.nome}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={styles.label}>
                            Introdução
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputGrande,
                            ]}
                            placeholder="Introdução da orientação..."
                            placeholderTextColor="#A1AAAE"
                            value={introducao}
                            onChangeText={setIntroducao}
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.tituloDicas}>
                            <Text style={styles.labelSemMargem}>
                                Dicas práticas
                            </Text>

                            <Text style={styles.textoOpcional}>
                                opcional
                            </Text>
                        </View>

                        <CampoDica
                            numero="1"
                            value={dica1}
                            onChangeText={setDica1}
                        />

                        <CampoDica
                            numero="2"
                            value={dica2}
                            onChangeText={setDica2}
                        />

                        <CampoDica
                            numero="3"
                            value={dica3}
                            onChangeText={setDica3}
                        />

                        <CampoDica
                            numero="4"
                            value={dica4}
                            onChangeText={setDica4}
                        />

                        <Text style={styles.label}>
                            Lembrete
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputLembrete,
                            ]}
                            placeholder="Lembrete importante..."
                            placeholderTextColor="#A1AAAE"
                            value={lembrete}
                            onChangeText={setLembrete}
                            multiline
                            textAlignVertical="top"
                        />

                        <Pressable
                            style={styles.botaoSalvar}
                            onPress={salvarAlteracoes}
                        >
                            <Text style={styles.textoBotaoSalvar}>
                                Salvar alterações
                            </Text>
                        </Pressable>
                    </View>


                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

type CampoDicaProps = {
    numero: string;
    value: string;
    onChangeText: (texto: string) => void;
};

function CampoDica({
    numero,
    value,
    onChangeText,
}: CampoDicaProps) {
    return (
        <View style={styles.campoDica}>
            <View style={styles.numeroDica}>
                <Text style={styles.numeroDicaTexto}>
                    {numero}
                </Text>
            </View>

            <TextInput
                style={styles.inputDica}
                placeholder={`Dica ${numero}`}
                placeholderTextColor="#A1AAAE"
                value={value}
                onChangeText={onChangeText}
                multiline
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
    },

    flex: {
        flex: 1,
    },

    carregando: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    carregandoEmoji: {
        fontSize: 42,
    },

    carregandoTexto: {
        color: '#667277',
        fontSize: 13,
        marginTop: 10,
    },

    conteudo: {
        paddingHorizontal: 18,
        paddingBottom: 35,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 22,
    },

    botaoVoltar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },



    tituloPagina: {
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
    },



    apresentacao: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        paddingHorizontal: 4,
    },

    iconeApresentacao: {
        width: 57,
        height: 57,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },


    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
    },

    subtituloApresentacao: {
        color: '#77858B',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 3,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
    },

    label: {
        color: '#4D5A60',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 7,
    },

    labelSemMargem: {
        color: '#4D5A60',
        fontSize: 13,
        fontWeight: '700',
    },

    input: {
        minHeight: 50,
        borderRadius: 14,
        backgroundColor: '#F5F9FA',
        borderWidth: 1,
        borderColor: '#E1ECEF',
        paddingHorizontal: 14,
        color: '#3E494F',
        fontSize: 13,
        marginBottom: 17,
    },

    inputGrande: {
        height: 105,
        paddingTop: 13,
    },

    inputLembrete: {
        height: 85,
        paddingTop: 13,
    },

    gradeCategorias: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 17,
    },

    categoria: {
        width: '48%',
        minHeight: 75,
        borderRadius: 16,
        backgroundColor: '#F5F9FA',
        borderWidth: 1,
        borderColor: '#E1ECEF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 9,
        paddingHorizontal: 5,
        gap: 5,
    },

    categoriaSelecionada: {
        backgroundColor: '#FFF0F4',
        borderColor: '#FF7FA3',
        borderWidth: 1.5,
    },


    textoCategoria: {
        color: '#667277',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },

    textoCategoriaSelecionada: {
        color: '#E75E87',
        fontWeight: '700',
    },

    tituloDicas: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9,
    },

    textoOpcional: {
        color: '#9AA6AB',
        fontSize: 9,
    },

    campoDica: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 9,
    },

    numeroDica: {
        width: 29,
        height: 29,
        borderRadius: 15,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },

    numeroDicaTexto: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
    },

    inputDica: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: '#F5F9FA',
        borderWidth: 1,
        borderColor: '#E1ECEF',
        paddingHorizontal: 13,
        paddingVertical: 10,
        color: '#3E494F',
        fontSize: 12,
    },

    botaoSalvar: {
        height: 53,
        borderRadius: 16,
        backgroundColor: '#42A5D5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotaoSalvar: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
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
});
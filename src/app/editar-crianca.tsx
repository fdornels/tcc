import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { auth, db } from '../../config/firebase';

import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Crianca = {
    nome: string;
    apelido: string;
    dataNascimento: string;
    sexo?: 'Menina' | 'Menino' | 'Prefiro não identificar';
    escola: string;
    comunicacao: string;
    preferencias: string;
    sensibilidades: string;
    observacoes: string;
};

export default function EditarCriancaScreen() {
    const [fotoCrianca, setFotoCrianca] = useState<string | null>(null);
    const [nome, setNome] = useState('');
    const [apelido, setApelido] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [sexo, setSexo] = useState<
        'Menina' | 'Menino' | 'Prefiro não identificar'
    >('Prefiro não identificar');
    const [escola, setEscola] = useState('');
    const [comunicacao, setComunicacao] = useState('');
    const [preferencias, setPreferencias] = useState('');
    const [sensibilidades, setSensibilidades] = useState('');
    const [observacoes, setObservacoes] = useState('');

    const [carregando, setCarregando] = useState(true);
async function enviarFotoCrianca(uri: string, uid: string) {
  const usuarioAtual = auth.currentUser;

  if (!usuarioAtual || usuarioAtual.uid !== uid) {
    throw new Error('Usuário não autorizado.');
  }

  const token = await usuarioAtual.getIdToken();

  const resposta = await FileSystem.uploadAsync(
    'https://teajudo-api.onrender.com/fotos/crianca',
    uri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'foto',
      mimeType: 'image/jpeg',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const dados = JSON.parse(resposta.body);

  if (resposta.status < 200 || resposta.status >= 300) {
    throw new Error(dados.erro || 'Erro ao enviar foto.');
  }
await setDoc(
  doc(db, 'usuarios', uid, 'crianca', 'dados'),
  {
    fotoUrl: dados.fotoUrl,
  },
  {
    merge: true,
  }
);
  return dados.fotoUrl;
}

async function escolherFotoCrianca() {
    const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
        Alert.alert(
            'Permissão necessária',
            'Permita o acesso à galeria para escolher uma foto.'
        );
        return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (resultado.canceled) {
        return;
    }

    const usuarioAtual = auth.currentUser;

    if (!usuarioAtual) {
        Alert.alert(
            'Erro',
            'Você precisa estar conectada para alterar a foto.'
        );
        return;
    }

    try {
        const uri = resultado.assets[0].uri;

        const novaFotoUrl = await enviarFotoCrianca(
            uri,
            usuarioAtual.uid
        );

        setFotoCrianca(novaFotoUrl);

        Alert.alert(
            'Foto atualizada!',
            'A foto da criança foi salva com sucesso.'
        );
        } catch (erro) {
        console.log('Erro ao enviar foto da criança:', erro);

        const mensagem =
            erro instanceof Error
                ? erro.message
                : String(erro);

        Alert.alert(
            'Erro ao enviar foto',
            mensagem
        );
    }
}
    
    async function excluirFotoCrianca() {
        const usuarioAtual = auth.currentUser;

        if (!usuarioAtual || !fotoCrianca) {
            return;
        }

        Alert.alert(
            'Excluir foto',
            'Deseja remover a foto da criança?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {

const token = await usuarioAtual.getIdToken();
const resposta = await fetch(
 'https://teajudo-api.onrender.com/fotos/crianca',
  {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (!resposta.ok) {
  throw new Error('Não foi possível excluir a foto do Cloudinary.');
}


                            await setDoc(
                                doc(
                                    db,
                                    'usuarios',
                                    usuarioAtual.uid,
                                    'crianca',
                                    'dados'
                                ),
                                {
                                    fotoUrl: '',
                                },
                                {
                                    merge: true,
                                }
                            );
                            const fotoSalva =
                                `${FileSystem.documentDirectory}crianca/${usuarioAtual.uid}.jpg`;

                            const infoFoto =
                                await FileSystem.getInfoAsync(fotoSalva);

                            if (infoFoto.exists) {
                                await FileSystem.deleteAsync(
                                    fotoSalva,
                                    {
                                        idempotent: true,
                                    }
                                );
                            }

                            setFotoCrianca(null);
                        } catch (erro) {
                            console.log(
                                'Erro ao excluir foto da criança:',
                                erro
                            );

                            Alert.alert(
                                'Erro',
                                'Não foi possível excluir a foto.'
                            );
                        }
                    },
                },
            ]
        );
    }
    async function carregarCrianca() {
        try {
            setCarregando(true);

            const usuario = auth.currentUser;

            if (!usuario) {
                Alert.alert(
                    'Erro',
                    'Você precisa estar conectada.'
                );
                router.replace('/login');
                return;
            }

            const referencia = doc(
                db,
                'usuarios',
                usuario.uid,
                'crianca',
                'dados'
            );

            const documento = await getDoc(referencia);

            if (!documento.exists()) {
                Alert.alert(
                    'Cadastro não encontrado',
                    'Não encontramos uma criança cadastrada.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                router.replace('/minha-crianca'),
                        },
                    ]
                );

                return;
            }

            const crianca = documento.data() as Crianca;

            setNome(crianca.nome ?? '');
            setApelido(crianca.apelido ?? '');
            setDataNascimento(crianca.dataNascimento ?? '');
            setSexo(crianca.sexo ?? 'Prefiro não identificar');
            setEscola(crianca.escola ?? '');
            setComunicacao(crianca.comunicacao ?? '');
            setPreferencias(crianca.preferencias ?? '');
            setSensibilidades(crianca.sensibilidades ?? '');
            setObservacoes(crianca.observacoes ?? '');

        } catch (erro) {
            console.log(
                'Erro ao carregar criança:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar as informações.'
            );
        } finally {
            setCarregando(false);
        }
    }
    async function carregarFotoCrianca() {
    const usuarioAtual = auth.currentUser;

    setFotoCrianca(null);

    if (!usuarioAtual) return;

    try {
        const referencia = doc(
            db,
            'usuarios',
            usuarioAtual.uid,
            'crianca',
            'dados'
        );

        const documento = await getDoc(referencia);

        if (!documento.exists()) return;

        const fotoUrl = documento.data().fotoUrl;

        if (typeof fotoUrl === 'string' && fotoUrl.trim()) {
            setFotoCrianca(fotoUrl);
        }
    } catch (erro) {
        console.log('Erro ao carregar foto da criança:', erro);
        setFotoCrianca(null);
    }
}
    useFocusEffect(
        useCallback(() => {
            carregarCrianca();
            carregarFotoCrianca();
        }, [])
    );

    function formatarData(texto: string) {
        const numeros = texto
            .replace(/\D/g, '')
            .slice(0, 8);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 4) {
            return `${numeros.slice(
                0,
                2
            )}/${numeros.slice(2)}`;
        }

        return `${numeros.slice(
            0,
            2
        )}/${numeros.slice(
            2,
            4
        )}/${numeros.slice(4)}`;
    }

    async function salvarAlteracoes() {
        if (!nome.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Informe o nome da criança.'
            );

            return;
        }

        if (!dataNascimento.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Informe a data de nascimento.'
            );

            return;
        }

        if (dataNascimento.length !== 10) {
            Alert.alert(
                'Data inválida',
                'Informe a data no formato DD/MM/AAAA.'
            );

            return;
        }

        const criancaAtualizada: Crianca = {
            nome: nome.trim(),
            apelido: apelido.trim(),
            dataNascimento: dataNascimento.trim(),
            sexo,
            escola: escola.trim(),
            comunicacao: comunicacao.trim(),
            preferencias: preferencias.trim(),
            sensibilidades: sensibilidades.trim(),
            observacoes: observacoes.trim(),

        };

        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                Alert.alert(
                    'Erro',
                    'Você precisa estar conectada.'
                );
                return;
            }

            await setDoc(
  doc(
    db,
    'usuarios',
    usuario.uid,
    'crianca',
    'dados'
  ),
  criancaAtualizada,
  { merge: true }
);

            Alert.alert(
                'Informações atualizadas! 💙',
                'As alterações foram salvas com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/minha-crianca'),
                    },
                ]
            );
        } catch (erro) {
            console.log(
                'Erro ao atualizar criança:',
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
                    <Ionicons
                        name="sync-outline"
                        size={30}
                        color="#42A5D5"
                    />

                    <Text style={styles.textoCarregando}>
                        Carregando informações...
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

                        <Text style={styles.tituloCabecalho}>
                            Editar informações
                        </Text>

                        <View style={{ width: 36 }} />
                    </View>

                    {/* APRESENTAÇÃO */}
                    <View style={styles.apresentacao}>
                        <View style={styles.iconeApresentacao}>
                            <Ionicons
                                name="create-outline"
                                size={24}
                                color="#FF7FA3"
                            />
                        </View>

                        <View style={styles.textoApresentacao}>
                            <Text style={styles.tituloApresentacao}>
                                Atualizar informações
                            </Text>

                            <Text style={styles.subtituloApresentacao}>
                                Altere somente o que for necessário e
                                salve as mudanças.
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        style={styles.avatarCrianca}
                        onPress={() => {
                            if (!fotoCrianca) {
                                escolherFotoCrianca();
                                return;
                            }

                            Alert.alert(
                                'Foto da criança',
                                'O que você deseja fazer?',
                                [
                                    {
                                        text: 'Trocar foto',
                                        onPress: escolherFotoCrianca,
                                    },
                                    {
                                        text: 'Excluir foto',
                                        style: 'destructive',
                                        onPress: excluirFotoCrianca,
                                    },
                                    {
                                        text: 'Cancelar',
                                        style: 'cancel',
                                    },
                                ]
                            );
                        }}
                    >
                        {fotoCrianca ? (
                            <Image
                                source={{ uri: fotoCrianca }}
                                style={styles.fotoCrianca}
                            />
                        ) : (
                            <Ionicons
                                name="camera-outline"
                                size={30}
                                color="#42A5D5"
                            />
                        )}
                    </Pressable>

                    <Text style={styles.textoAlterarFoto}>
                        {fotoCrianca
                            ? 'Toque para alterar ou excluir a foto'
                            : 'Toque para adicionar uma foto'}
                    </Text>
                    {/* DADOS BÁSICOS */}
                    <Text style={styles.tituloSecao}>
                        Dados básicos
                    </Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>
                            Nome *
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nome da criança"
                            placeholderTextColor="#A1AAAE"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <Text style={styles.label}>
                            Como gosta de ser chamada
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Apelido ou nome preferido"
                            placeholderTextColor="#A1AAAE"
                            value={apelido}
                            onChangeText={setApelido}
                        />

                        <Text style={styles.label}>
                            Data de nascimento *
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#A1AAAE"
                            value={dataNascimento}
                            onChangeText={(texto) =>
                                setDataNascimento(
                                    formatarData(texto)
                                )
                            }
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        <Text style={styles.label}>
                            Identificação
                        </Text>

                        <View style={styles.opcoesSexo}>
                            <Pressable
                                style={[
                                    styles.opcaoSexo,
                                    sexo === 'Menina' && styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo('Menina')}
                            >
                                <Ionicons
                                    name="female-outline"
                                    size={23}
                                    color={sexo === 'Menina' ? '#FF7FA3' : '#42A5D5'}
                                />
                                <Text style={styles.textoSexo}>Menina</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.opcaoSexo,
                                    sexo === 'Menino' && styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo('Menino')}
                            >
                                <Ionicons
                                    name="male-outline"
                                    size={23}
                                    color={sexo === 'Menino' ? '#FF7FA3' : '#42A5D5'}
                                />
                                <Text style={styles.textoSexo}>Menino</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.opcaoSexo,
                                    sexo === 'Prefiro não identificar' &&
                                    styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo('Prefiro não identificar')}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={23}
                                    color={
                                        sexo === 'Prefiro não identificar'
                                            ? '#FF7FA3'
                                            : '#42A5D5'
                                    }
                                />
                                <Text style={styles.textoSexo}>
                                    Prefiro não identificar
                                </Text>
                            </Pressable>
                        </View>
                        <Text style={styles.label}>
                            Escola
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputUltimo,
                            ]}
                            placeholder="Nome da escola"
                            placeholderTextColor="#A1AAAE"
                            value={escola}
                            onChangeText={setEscola}
                        />
                    </View>

                    {/* COMUNICAÇÃO */}
                    <Text style={styles.tituloSecao}>
                        Comunicação
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={23}
                                color="#42A5D5"
                                style={{ marginRight: 10 }}
                            />

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    Como a criança se comunica?
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Fala, gestos, comunicação alternativa
                                    ou outras formas.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Descreva aqui..."
                            placeholderTextColor="#A1AAAE"
                            value={comunicacao}
                            onChangeText={setComunicacao}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* PREFERÊNCIAS */}
                    <Text style={styles.tituloSecao}>
                        Preferências e interesses
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Ionicons
                                name="heart-outline"
                                size={23}
                                color="#FF7FA3"
                                style={{ marginRight: 10 }}
                            />

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    Do que ela gosta?
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Interesses, atividades, alimentos,
                                    personagens e formas de conforto.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Descreva as preferências..."
                            placeholderTextColor="#A1AAAE"
                            value={preferencias}
                            onChangeText={setPreferencias}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* SENSIBILIDADES */}
                    <Text style={styles.tituloSecao}>
                        Sensibilidades
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Ionicons
                                name="options-outline"
                                size={23}
                                color="#42A5D5"
                                style={{ marginRight: 10 }}
                            />

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    O que merece atenção?
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Estímulos e situações que podem causar
                                    desconforto.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Descreva as sensibilidades..."
                            placeholderTextColor="#A1AAAE"
                            value={sensibilidades}
                            onChangeText={setSensibilidades}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* OBSERVAÇÕES */}
                    <Text style={styles.tituloSecao}>
                        Outras informações
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Ionicons
                                name="document-text-outline"
                                size={23}
                                color="#FF7FA3"
                                style={{ marginRight: 10 }}
                            />

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    Observações importantes
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Outras informações úteis para o
                                    acompanhamento.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Adicione alguma informação..."
                            placeholderTextColor="#A1AAAE"
                            value={observacoes}
                            onChangeText={setObservacoes}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <Text style={styles.camposObrigatorios}>
                        * Campos obrigatórios
                    </Text>

                    <Pressable
                        style={styles.botaoSalvar}
                        onPress={salvarAlteracoes}
                    >
                        <Text style={styles.textoBotaoSalvar}>
                            Salvar alterações
                        </Text>
                    </Pressable>


                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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

    conteudo: {
        paddingHorizontal: 18,
        paddingBottom: 35,
    },

    carregando: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },



    textoCarregando: {
        color: '#64747B',
        fontSize: 13,
        fontWeight: '600',
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 20,
    },

    botaoVoltar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    seta: {
        color: '#4288AF',
        fontSize: 30,
        lineHeight: 31,
    },

    tituloCabecalho: {
        flex: 1,
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
    },

    estrela: {
        width: 36,
        color: '#FFD447',
        fontSize: 29,
        textAlign: 'center',
    },

    apresentacao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        marginBottom: 22,
    },

    iconeApresentacao: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#F8DCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiApresentacao: {
        fontSize: 29,
    },

    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
    },

    subtituloApresentacao: {
        color: '#829096',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 4,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 9,
        marginLeft: 2,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        marginBottom: 20,
    },

    label: {
        color: '#4D5A60',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 7,
    },

    labelSemMargem: {
        color: '#4D5A60',
        fontSize: 12,
        fontWeight: '700',
    },

    input: {
        height: 49,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 14,
        color: '#3E494F',
        fontSize: 12,
        marginBottom: 15,
    },

    inputUltimo: {
        marginBottom: 0,
    },

    cabecalhoCampo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },



    textoCampo: {
        flex: 1,
    },

    ajudaCampo: {
        color: '#8A969B',
        fontSize: 9,
        lineHeight: 13,
        marginTop: 3,
    },

    areaTexto: {
        minHeight: 90,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        color: '#3E494F',
        fontSize: 12,
    },

    camposObrigatorios: {
        color: '#8B979C',
        fontSize: 9,
        marginBottom: 10,
        marginLeft: 3,
    },

    botaoSalvar: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#42A5D5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotaoSalvar: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },


    opcoesSexo: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 15,
    },

    opcaoSexo: {
        flex: 1,
        minHeight: 72,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        paddingVertical: 8,
    },

    opcaoSexoSelecionada: {
        backgroundColor: '#E8F7FB',
        borderColor: '#4288AF',
        borderWidth: 2,
    },

    emojiSexo: {
        fontSize: 24,
        marginBottom: 4,
    },

    textoSexo: {
        color: '#4D5A60',
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
    avatarCrianca: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFFFFF',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: 15,
    },

    fotoCrianca: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },



    textoAlterarFoto: {
        color: '#4288AF',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 7,
        marginBottom: 20,
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
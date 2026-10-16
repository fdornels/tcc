import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from 'expo-router';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { calcularIdade } from '../utils/calcularIdade';

import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
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

export default function MinhaCriancaScreen() {
    const [crianca, setCrianca] = useState<Crianca | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [fotoCrianca, setFotoCrianca] = useState<string | null>(null);

    function voltar() {
        router.back();
    }

    function cadastrarCrianca() {
        router.push('/cadastrar-crianca');
    }

    function editarCrianca() {
        router.push('/editar-crianca');
    }
   async function carregarFotoCrianca() {
  const usuarioAtual = auth.currentUser;

  setFotoCrianca(null);

  if (!usuarioAtual) {
    return;
  }

  try {
    const referencia = doc(
      db,
      'usuarios',
      usuarioAtual.uid,
      'crianca',
      'dados'
    );

    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      return;
    }

    const fotoUrl = documento.data().fotoUrl;

    if (typeof fotoUrl === 'string' && fotoUrl.trim()) {
      setFotoCrianca(fotoUrl);
    }
  } catch (erro) {
    console.log('Erro ao carregar foto da criança:', erro);
    setFotoCrianca(null);
  }
}

    function excluirCrianca() {
        Alert.alert(
            'Excluir cadastro',
            'Tem certeza que deseja excluir as informações da criança? Essa ação não poderá ser desfeita.',
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
                            const usuario = auth.currentUser;

                            if (!usuario) {
                                Alert.alert(
                                    'Erro',
                                    'Você precisa estar conectada.'
                                );
                                return;
                            }
const token = await usuario.getIdToken();

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

const fotoLocal =
  `${FileSystem.documentDirectory}crianca/${usuario.uid}.jpg`;

await FileSystem.deleteAsync(fotoLocal, {
  idempotent: true,
});
                            await deleteDoc(
                                doc(
                                    db,
                                    'usuarios',
                                    usuario.uid,
                                    'crianca',
                                    'dados'
                                )
                            );

                            setCrianca(null);
setFotoCrianca(null);

                            Alert.alert(
                                'Cadastro excluído',
                                'As informações da criança foram excluídas.'
                            );
                        } catch (erro) {
                            console.log(
                                'Erro ao excluir criança:',
                                erro
                            );

                            Alert.alert(
                                'Erro',
                                'Não foi possível excluir o cadastro.'
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
                setCrianca(null);
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

            if (documento.exists()) {
                const dados = documento.data() as Crianca;
                setCrianca(dados);
            } else {
                setCrianca(null);
            }
        } catch (erro) {
            console.log('Erro ao carregar criança:', erro);
            setCrianca(null);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarCrianca();
            carregarFotoCrianca();
        }, [])
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
                        onPress={voltar}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#42A5D5"
                        />
                    </Pressable>

                    <Text style={styles.tituloCabecalho}>
                        Minha Criança
                    </Text>

                    <View style={styles.espacoCabecalho} />
                </View>

                {carregando ? (
                    <View style={styles.cardVazio}>
                        <Text style={styles.emojiCarregando}>🧸</Text>

                        <Text style={styles.tituloVazio}>
                            Carregando informações...
                        </Text>
                    </View>
                ) : crianca ? (
                    <>
                        {/* PERFIL */}
                        <View style={styles.perfil}>
                            <View style={styles.avatar}>
                                {fotoCrianca ? (
                                    <Image
                                        source={{ uri: fotoCrianca }}
                                        style={styles.fotoCrianca}
                                    />
                                ) : (
                                    <View style={styles.iconeCrianca}>
                                        <Ionicons
                                            name="happy-outline"
                                            size={38}
                                            color="#FF7FA3"
                                        />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.nomeCrianca}>
                                {crianca.apelido || crianca.nome}
                            </Text>

                            {crianca.apelido ? (
                                <Text style={styles.nomeCompleto}>
                                    {crianca.nome}
                                </Text>
                            ) : null}
{calcularIdade(crianca.dataNascimento) !== null && (
    <Text style={styles.nomeCompleto}>
        {calcularIdade(crianca.dataNascimento)} anos
    </Text>
)}
                            <View style={styles.dataNascimento}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={15}
                                    color="#42A5D5"
                                    style={{ marginRight: 5 }}
                                />

                                <Text style={styles.dataTexto}>
                                    {crianca.dataNascimento}
                                </Text>
                            </View>
                        </View>

                        {/* DADOS BÁSICOS */}
                        <Text style={styles.tituloSecao}>
                            Dados pessoais
                        </Text>

                        <View style={styles.cardInformacao}>
                            <LinhaInformacao
                                icone={
                                    crianca.sexo === 'Menina'
                                        ? 'female-outline'
                                        : crianca.sexo === 'Menino'
                                            ? 'male-outline'
                                            : 'person-outline'
                                }
                                titulo="Nome"
                                valor={crianca.nome}
                            />

                            {crianca.apelido ? (
                                <LinhaInformacao
                                    icone="heart-outline"
                                    titulo="Como gosta de ser chamada"
                                    valor={crianca.apelido}
                                />
                            ) : null}

                            <LinhaInformacao
                                icone="calendar-outline"
                                titulo="Data de nascimento"
                                valor={crianca.dataNascimento}
                            />

                            {crianca.escola ? (
                                <LinhaInformacao
                                    icone="school-outline"
                                    titulo="Escola"
                                    valor={crianca.escola}
                                    ultimo
                                />
                            ) : null}
                        </View>

                        {/* COMUNICAÇÃO */}
                        {crianca.comunicacao ? (
                            <>
                                <Text style={styles.tituloSecao}>
                                    Comunicação
                                </Text>

                                <CardTexto
                                    icone="chatbubble-ellipses-outline"
                                    titulo="Como se comunica"
                                    texto={crianca.comunicacao}
                                    cor="#EAF7FC"
                                />
                            </>
                        ) : null}

                        {/* PREFERÊNCIAS */}
                        {crianca.preferencias ? (
                            <>
                                <Text style={styles.tituloSecao}>
                                    Preferências e interesses
                                </Text>

                                <CardTexto
                                    icone="heart-outline"
                                    titulo="Do que gosta"
                                    texto={crianca.preferencias}
                                    cor="#FFF0F5"
                                    corIcone="#FF7FA3"
                                />
                            </>
                        ) : null}

                        {/* SENSIBILIDADES */}
                        {crianca.sensibilidades ? (
                            <>
                                <Text style={styles.tituloSecao}>
                                    Sensibilidades
                                </Text>

                                <CardTexto
                                    icone="options-outline"
                                    titulo="O que merece atenção"
                                    texto={crianca.sensibilidades}
                                    cor="#EAF7FC"
                                />
                            </>
                        ) : null}

                        {/* OBSERVAÇÕES */}
                        {crianca.observacoes ? (
                            <>
                                <Text style={styles.tituloSecao}>
                                    Outras informações
                                </Text>

                                <CardTexto
                                    icone="document-text-outline"
                                    titulo="Observações importantes"
                                    texto={crianca.observacoes}
                                    cor="#FFF0F5"
                                    corIcone="#FF7FA3"
                                />
                            </>
                        ) : null}

                        <Pressable
                            style={styles.botaoEditar}
                            onPress={editarCrianca}
                        >
                            <Ionicons
                                name="create-outline"
                                size={19}
                                color="#FFFFFF"
                                style={{ marginRight: 7 }}
                            />

                            <Text style={styles.textoBotaoEditar}>
                                Editar informações
                            </Text>
                        </Pressable>

                        {/* BOTÃO EXCLUIR */}
                        <Pressable
                            style={styles.botaoExcluir}
                            onPress={excluirCrianca}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#D96989"
                                style={{ marginRight: 7 }}
                            />

                            <Text style={styles.textoBotaoExcluir}>
                                Excluir cadastro
                            </Text>
                        </Pressable>

                        <View style={styles.aviso}>
                            <Ionicons
                                name="heart-outline"
                                size={25}
                                color="#42A5D5"
                                style={{ marginRight: 11 }}
                            />

                            <View style={styles.textoAvisoContainer}>
                                <Text style={styles.tituloAviso}>
                                    Cada criança é única
                                </Text>

                                <Text style={styles.textoAviso}>
                                    Essas informações podem ser atualizadas
                                    sempre que necessário.
                                </Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        {/* APRESENTAÇÃO */}
                        <View style={styles.apresentacao}>
                            <View style={styles.avatar}>
                                <Ionicons
  name="person-outline"
  size={34}
  color="#42A5D5"
/>
                            </View>

                            <Text style={styles.tituloApresentacao}>
                                Conheça e acompanhe 💙
                            </Text>

                            <Text style={styles.textoApresentacao}>
                                Mantenha reunidas as informações importantes
                                sobre a criança para facilitar o cuidado e o
                                acompanhamento no dia a dia.
                            </Text>
                        </View>

                        {/* SEM CADASTRO */}
                        <View style={styles.cardVazio}>
                            <View style={styles.iconeVazio}>
                                <Text style={styles.emojiVazio}>🧸</Text>
                            </View>

                            <Text style={styles.tituloVazio}>
                                Nenhuma criança cadastrada
                            </Text>

                            <Text style={styles.textoVazio}>
                                Cadastre as principais informações da criança
                                para começar a organizar seu acompanhamento.
                            </Text>

                            <Pressable
                                style={styles.botaoCadastrar}
                                onPress={cadastrarCrianca}
                            >
                                <Text style={styles.mais}>＋</Text>

                                <Text style={styles.textoBotaoCadastrar}>
                                    Cadastrar criança
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={styles.tituloSecao}>
                            Informações que você poderá registrar
                        </Text>

                        <View style={styles.grade}>
                            <View
                                style={[
                                    styles.cardPequeno,
                                    styles.cardAzul,
                                ]}
                            >
                                <Text style={styles.emojiCard}>👶</Text>

                                <Text style={styles.tituloCard}>
                                    Dados pessoais
                                </Text>

                                <Text style={styles.descricaoCard}>
                                    Nome, nascimento e informações básicas
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.cardPequeno,
                                    styles.cardAmarelo,
                                ]}
                            >
                                <Text style={styles.emojiCard}>⭐</Text>

                                <Text style={styles.tituloCard}>
                                    Informações importantes
                                </Text>

                                <Text style={styles.descricaoCard}>
                                    Dados úteis para o cuidado diário
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.cardPequeno,
                                    styles.cardRosa,
                                ]}
                            >
                                <Text style={styles.emojiCard}>💗</Text>

                                <Text style={styles.tituloCard}>
                                    Preferências
                                </Text>

                                <Text style={styles.descricaoCard}>
                                    Gostos, interesses e formas de conforto
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.cardPequeno,
                                    styles.cardVerde,
                                ]}
                            >
                                <Text style={styles.emojiCard}>🧩</Text>

                                <Text style={styles.tituloCard}>
                                    Sensibilidades
                                </Text>

                                <Text style={styles.descricaoCard}>
                                    Situações e estímulos que merecem atenção
                                </Text>
                            </View>
                        </View>
                    </>
                )}


            </ScrollView>
        </SafeAreaView >
    );
}

type LinhaInformacaoProps = {
    icone: string;
    titulo: string;
    valor: string;
    ultimo?: boolean;
    corIcone?: string;
};

function LinhaInformacao({
    icone,
    titulo,
    valor,
    ultimo = false,
    corIcone = '#42A5D5',
}: LinhaInformacaoProps) {
    return (
        <View
            style={[
                styles.linhaInformacao,
                ultimo && styles.linhaSemBorda,
            ]}
        >
            <View style={styles.iconeLinha}>
                <Ionicons
                    name={icone as keyof typeof Ionicons.glyphMap}
                    size={21}
                    color={corIcone}
                />
            </View>

            <View style={styles.conteudoLinha}>
                <Text style={styles.tituloLinha}>{titulo}</Text>
                <Text style={styles.valorLinha}>{valor}</Text>
            </View>
        </View>
    );
}

type CardTextoProps = {
    icone: string;
    titulo: string;
    texto: string;
    cor: string;
    corIcone?: string;
};

function CardTexto({
    icone,
    titulo,
    texto,
    cor,
    corIcone = '#42A5D5',
}: CardTextoProps) {
    return (
        <View style={styles.cardTexto}>
            <View
                style={[
                    styles.iconeCardTexto,
                    { backgroundColor: cor },
                ]}
            >
                <Ionicons
                    name={icone as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={corIcone}
                />
            </View>

            <View style={styles.conteudoCardTexto}>
                <Text style={styles.tituloCardTexto}>
                    {titulo}
                </Text>

                <Text style={styles.textoCardTexto}>
                    {texto}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
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

    conteudo: {
        paddingHorizontal: 18,
        paddingBottom: 35,
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
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 15,
    },

    perfil: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
        marginBottom: 22,
    },

    avatar: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    fotoCrianca: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },

    perfilAvatar: {
        backgroundColor: '#E8F7FB',
    },

    avatarEmoji: {
        fontSize: 45,
    },

    tituloApresentacao: {
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
    },

    textoApresentacao: {
        color: '#7C898F',
        fontSize: 11,
        lineHeight: 17,
        textAlign: 'center',
        marginTop: 5,
    },

    nomeCrianca: {
        color: '#40515A',
        fontSize: 21,
        fontWeight: '700',
        textAlign: 'center',
    },

    nomeCompleto: {
        color: '#849095',
        fontSize: 11,
        marginTop: 3,
        textAlign: 'center',
    },

    dataNascimento: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAF7FC',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginTop: 11,
    },

    dataEmoji: {
        fontSize: 14,
        marginRight: 5,
    },

    dataTexto: {
        color: '#5B656A',
        fontSize: 11,
        fontWeight: '600',
    },

    cardVazio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 22,
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 25,
    },

    emojiCarregando: {
        fontSize: 35,
        marginBottom: 10,
    },

    iconeVazio: {
        width: 62,
        height: 62,
        borderRadius: 20,
        backgroundColor: '#FFF1C9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    emojiVazio: {
        fontSize: 32,
    },

    tituloVazio: {
        color: '#45535A',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        textAlign: 'center',
    },

    textoVazio: {
        color: '#8B979C',
        fontSize: 11,
        lineHeight: 17,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 18,
    },

    botaoCadastrar: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        backgroundColor: '#FF7FA3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    mais: {
        color: '#FFFFFF',
        fontSize: 23,
        marginRight: 6,
        marginTop: -2,
    },

    textoBotaoCadastrar: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
        marginLeft: 2,
    },

    cardInformacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingHorizontal: 16,
        marginBottom: 21,
    },

    linhaInformacao: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF1F2',
    },

    linhaSemBorda: {
        borderBottomWidth: 0,
    },

    iconeLinha: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#E8F7FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    emojiLinha: {
        fontSize: 21,
    },

    conteudoLinha: {
        flex: 1,
    },

    tituloLinha: {
        color: '#89959A',
        fontSize: 9,
        marginBottom: 3,
    },

    valorLinha: {
        color: '#455259',
        fontSize: 12,
        fontWeight: '600',
    },

    cardTexto: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 15,
        marginBottom: 21,
    },

    iconeCardTexto: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiCardTexto: {
        fontSize: 25,
    },

    conteudoCardTexto: {
        flex: 1,
    },

    tituloCardTexto: {
        color: '#46535A',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 5,
    },

    textoCardTexto: {
        color: '#7D898E',
        fontSize: 10,
        lineHeight: 16,
    },

    botaoEditar: {
        height: 53,
        borderRadius: 16,
        backgroundColor: '#FF7FA3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },

    iconeEditar: {
        fontSize: 17,
        marginRight: 7,
    },

    textoBotaoEditar: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    botaoExcluir: {
        height: 50,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F2A3B8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },

    iconeExcluir: {
        fontSize: 16,
        marginRight: 7,
    },

    textoBotaoExcluir: {
        color: '#D96989',
        fontSize: 13,
        fontWeight: '700',
    },

    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    cardPequeno: {
        width: '48%',
        minHeight: 135,
        borderRadius: 20,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    cardAzul: {
        backgroundColor: '#E8F7FB',
    },

    cardAmarelo: {
        backgroundColor: '#FFF0C5',
    },

    cardRosa: {
        backgroundColor: '#F8DCE7',
    },

    cardVerde: {
        backgroundColor: '#DFF1D6',
    },

    emojiCard: {
        fontSize: 30,
        marginBottom: 8,
    },

    tituloCard: {
        color: '#4B585E',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },

    descricaoCard: {
        color: '#7D898E',
        fontSize: 9,
        lineHeight: 13,
        textAlign: 'center',
        marginTop: 4,
    },

    aviso: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginTop: 5,
    },

    iconeAviso: {
        fontSize: 27,
        marginRight: 11,
    },

    textoAvisoContainer: {
        flex: 1,
    },

    tituloAviso: {
        color: '#46545A',
        fontSize: 13,
        fontWeight: '700',
    },

    textoAviso: {
        color: '#849095',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 3,
    },

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 22,
    },

    decoracaoEmoji: {
        fontSize: 30,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },
    iconeCrianca: {
        width: 68,
        height: 68,
        borderRadius: 22,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 10,
    },
    espacoCabecalho: {
        width: 36,
        height: 36,
    },
});
import {
  Blur,
  Canvas,
  Circle,
  ColorMatrix,
  Group,
  Paint,
  SweepGradient,
  runSpring,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import React from 'react';
import {
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';

// O React Native Skia fornece muitas APIs declarativas para a criação de telas usando componentes React. No entanto, os componentes do Skia não são componentes reais, mas representações abstratas de uma parte de um desenho. Portanto, interações diretas com componentes individuais do Skia só podem ser obtidas indiretamente a partir do Canvas (tentando descobrir se o ponto na tela que foi clicado está dentro do elemento com o qual queremos interagir).

// Este pacote, simplesmente fornece um conjunto de APIs para poder interagir diretamente com componentes individuais. Cesar aqui: isso resolve a questão de não precisar clicar na área do Canvas para "ativar" o "onStart, onActive...". Basta clicar em cima do "Circle".
import Touchable, { useGestureHandler } from 'react-native-skia-gesture'

const { width, height } = Dimensions.get('window')
const SIZE_CIRCLE = 80;

export const App = () => {

  const cx = useValue(width / 2);
  const cy = useValue(height / 2);

  React.useEffect(() => {
    StatusBar.setHidden(true);
  }, [])

  // Sobre o segundo parâmetro "context": O gancho fornece como segundo parâmetro de cada retorno de chamada um contexto que pode ser usado opcionalmente. Pode ser usado para armazenar algum estado. Esse objeto persistirá entre eventos e entre manipuladores de worklet para todos os estados selecionados e você poderá ler e gravar quaisquer dados nele. Resumindo: se você usar um "console.log(context)" no onStart, você vai notar que o resultado é: "{}"; ou seja, um objeto vazio. Então nesse caso, em "onStart" (primeiro click), ao clicar pela primeira vez, eu crio um objeto com os parâtros "x" e "y" e faço com que esses parâmetro recebam "cx.current" e "cy.current" (posição inicial x e y do Circle: "width / 2" e "height / 2"). Assim eu posso usar a posição "x" e "y" do circulo para somar com "translationX" e "translationY" em "onActive". Então toda vez que eu arrastar o "Circle", ele não vai começar do 0 (sem o uso do "context" começa a partir do 0 porque "translationX" e "translationY" inicia no 0 toda vez que arrasta "onActive") e sim a partir da posição inicial de "Circle".

  // useGestureHandler é semelhante ao Gesture do Gesture.
  const circleGesture = useGestureHandler({
    onStart: (_, context) => {
      //console.log(context) = {}
      context.x = cx.current
      context.y = cy.current
    },
    // onActive é semelhante ao onUpdate do "Gesture".
    onActive: ({ translationX, translationY }, context) => {
      //console.log(context) = {x: ..., y:...}
      cx.current = translationX + context.x
      cy.current = translationY + context.y
    },
    onEnd: () => {
      runSpring(cx, width / 2)
      runSpring(cy, height / 2)
    }
  })

  // Uma outra forma de criar o <Paint> de layer usando useMemo.
  const layer = React.useMemo(() => {
    return <Paint>
      <Blur blur={40} />
      <ColorMatrix
        matrix={[
          1, 0, 0, 0, 0,
          0, 1, 0, 0, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 120, -60,
        ]}
      />
    </Paint>
  }, [])

  return (
    <Touchable.Canvas
      style={{
        width,
        height,
      }}
    >
      <Group
        layer={layer}
      >
        <Touchable.Circle
          cx={cx}
          cy={cy}
          r={SIZE_CIRCLE}
          {...circleGesture}
        >
        </Touchable.Circle>
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={SIZE_CIRCLE}
        />
        <SweepGradient
          c={vec(0, 0)}
          colors={["cyan", "magenta", "cyan"]}
        />
      </Group>
    </Touchable.Canvas>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default App;
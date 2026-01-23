import { TextInput, StyleSheet } from 'react-native';

export default function CustomInput(props) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
});

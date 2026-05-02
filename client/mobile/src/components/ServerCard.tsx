import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { TouchableOpacity, Text } from 'react-native-ui-lib';

interface ServerCardProps {
  style?: StyleProp<ViewStyle>;
  name: string;
  url?: string;
  version?: string;
  badge?: string;
  subtitle?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}
export const ServerCard: React.FC<ServerCardProps> = React.memo((props) => {
  return (
    <TouchableOpacity
      style={[styles.root, props.style]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
    >
      {props.badge && <Text style={styles.badge}>{props.badge}</Text>}
      <Text style={styles.name}>{props.name}</Text>

      {props.subtitle && (
        <Text style={styles.subtitle} grey30>
          {props.subtitle}
        </Text>
      )}

      {props.url && (
        <Text style={styles.url} grey30>
          {props.url}
        </Text>
      )}

      {props.version && (
        <Text style={styles.version} grey30>
          version: {props.version}
        </Text>
      )}
    </TouchableOpacity>
  );
});
ServerCard.displayName = 'ServerCard';

const styles = StyleSheet.create({
  root: {
    minHeight: 84,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 14,
    borderColor: '#d7dee7',
    borderWidth: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#eef5ff',
    color: '#0b4a8b',
    fontSize: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  version: {
    marginTop: 6,
    fontSize: 10,
  },
  url: {
    marginTop: 6,
    fontSize: 12,
  },
});

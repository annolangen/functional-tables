interface Cell {}
interface DataType {}
function text(): DataType {
  return {};
}
function numeric(): DataType {
  return {};
}
enum Order {
  ASC,
  DESC,
}
interface Column {
  name: string;
  type: DataType;
  order?: Order;
  // Somethin for width flex control
}
interface Row {
  is_odd?: boolean;
  is_selected?: boolean;
}
interface Table {
  columns: Column[];
  is_striped?: boolean;
  bordered?: boolean;
  horizontal?: boolean;
  selectable?: boolean;
  hoverable?: boolean;
  // Something for responsive, flex width
}

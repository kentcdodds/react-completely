export interface UseElementIDsProps {
  id: string
  labelId: string
  menuId: string
  getItemId(index: number): string
  toggleButtonId: string
  inputId?: string
}

export interface UseElementIDsResult {
  labelId: string
  menuId: string
  getItemId(index: number): string
  toggleButtonId: string
  inputId: string
}

export interface UseControlPropsValidatorProps {
	isInitialMount: boolean
	props: any
	state: any
}

import { Component, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor, EditorModule } from 'primeng/editor';
import Quill from 'quill';
import type { Quill as QuillInstance } from 'quill';

import { nextTrEditorFontSize, TrEditorFontSize } from '../../termo-referencia.utils';

const SizeClass = Quill.import('attributors/class/size') as { whitelist: string[] };
SizeClass.whitelist = ['small', 'large', 'huge'];
Quill.register(SizeClass, true);

@Component({
  selector: 'app-tr-campo-editor',
  standalone: true,
  imports: [EditorModule, FormsModule],
  templateUrl: './tr-campo-editor.component.html',
  styleUrl: './tr-campo-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TrCampoEditorComponent),
      multi: true,
    },
  ],
})
export class TrCampoEditorComponent implements ControlValueAccessor {
  @Input() readOnly = false;
  @Input() rows = 3;
  @Input() placeholder = '';

  @ViewChild(Editor) private editorRef?: Editor;

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get editorHeight(): string {
    return `${Math.max(6.5, this.rows * 1.85)}rem`;
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onEditorChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  decreaseFontSize(event: Event): void {
    event.preventDefault();
    this.applyFontSizeStep(-1);
  }

  increaseFontSize(event: Event): void {
    event.preventDefault();
    this.applyFontSizeStep(1);
  }

  private applyFontSizeStep(direction: 1 | -1): void {
    const quill = this.getQuill();
    if (!quill) {
      return;
    }

    const range = quill.getSelection(true);
    if (!range) {
      return;
    }

    const current = (quill.getFormat(range)['size'] ?? '') as TrEditorFontSize | string;
    const nextSize = nextTrEditorFontSize(current, direction);
    quill.format('size', nextSize || false, 'user');
  }

  private getQuill(): QuillInstance | null {
    return (this.editorRef?.getQuill?.() as QuillInstance | undefined) ?? null;
  }
}

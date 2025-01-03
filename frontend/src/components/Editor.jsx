import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { ACTIONS } from '../actions';

const Editor = ({ roomId, socketRef }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);

    useEffect(() => {
        const languageCompartment = new Compartment();
        const tabSizeCompartment = new Compartment();

        const state = EditorState.create({
            doc: 'console.log("Hello, Welcome to my code editor")',
            extensions: [
                basicSetup,
                languageCompartment.of(javascript()),
                tabSizeCompartment.of(EditorState.tabSize.of(4)),
                oneDark,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const code = update.state.doc.toString();
                        console.log('Code changed, emitting:', code);
                        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                            roomId,
                            code,
                        });
                    }
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        function setTabSize(size) {
            view.dispatch({
                effects: tabSizeCompartment.reconfigure(EditorState.tabSize.of(size)),
            });
        }

        setTabSize(2);

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null && viewRef.current) {
                    const currentCode = viewRef.current.state.doc.toString();
                    if (code !== currentCode) {
                        console.log("Updating editor with new code:", code);
                        viewRef.current.dispatch({
                            changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
                        });
                    }
                }
            });
        }

        return () => {
            view.destroy();
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }
        };
    }, [roomId, socketRef]);

    return <div ref={editorRef} style={{ height: "100%", width: "100%" }} />;
};

export default Editor;

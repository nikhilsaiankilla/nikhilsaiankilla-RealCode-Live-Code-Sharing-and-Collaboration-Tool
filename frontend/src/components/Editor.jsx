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
        // Define compartments for dynamic reconfiguration
        const languageCompartment = new Compartment();
        const tabSizeCompartment = new Compartment();

        // Initialize editor with compartments and basic setup
        const state = EditorState.create({
            doc: 'console.log("Hello, Welcome to my code editor")',
            extensions: [
                basicSetup,
                languageCompartment.of(javascript()),
                tabSizeCompartment.of(EditorState.tabSize.of(4)), // Set initial tab size to 4
                oneDark,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const code = update.state.doc.toString();
                        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                            roomId,
                            code,
                        });
                    }
                }),
            ],
        });

        // Create EditorView
        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        // Function to dynamically change tab size
        function setTabSize(size) {
            view.dispatch({
                effects: tabSizeCompartment.reconfigure(EditorState.tabSize.of(size)),
            });
        }

        // Set tab size dynamically, e.g., to 2
        setTabSize(2);

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, (code) => {
                console.log("Received code change:", code); // Debugging log
                if (code !== null && viewRef.current) {
                    const currentCode = viewRef.current.state.doc.toString();
                    if (code !== currentCode) {
                        console.log("Updating editor with new code:", code); // Debugging log
                        // Update the entire document with the new code
                        viewRef.current.dispatch({
                            changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
                        });
                    }
                }
            });
        }
        // Cleanup on component unmount
        return () => {
            view.destroy();
        };
    }, [roomId, socketRef]);

    // useEffect(() => {
    //     if (socketRef.current) {
    //         socketRef.current.on(ACTIONS.CODE_CHANGE, (code) => {
    //             console.log("Received code change:", code); // Debugging log
    //             if (code !== null && viewRef.current) {
    //                 const currentCode = viewRef.current.state.doc.toString();
    //                 if (code !== currentCode) {
    //                     console.log("Updating editor with new code:", code); // Debugging log
    //                     // Update the entire document with the new code
    //                     viewRef.current.dispatch({
    //                         changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
    //                     });
    //                 }
    //             }
    //         });
    //     }

    //     // Cleanup the socket listener on component unmount
    //     return () => {
    //         if (socketRef.current) {
    //             socketRef.current.off(ACTIONS.CODE_CHANGE);
    //         }
    //     };
    // }, [socketRef]);

    return <div ref={editorRef} style={{ height: "100%", width: "100%" }} />;
};

export default Editor;

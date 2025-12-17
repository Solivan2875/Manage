import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface EditableTableProps {
    html: string;
    onChange: (html: string) => void;
}

interface TableCell {
    content: string;
    isHeader: boolean;
    width?: string;
}

export const EditableTable = ({ html, onChange }: EditableTableProps) => {
    const [tableData, setTableData] = useState<TableCell[][]>([]);
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
    const [tempValue, setTempValue] = useState('');
    const [draggedRow, setDraggedRow] = useState<number | null>(null);
    const [dragOverRow, setDragOverRow] = useState<number | null>(null);
    const [resizingColumn, setResizingColumn] = useState<number | null>(null);
    const [startX, setStartX] = useState<number>(0);
    const [startWidth, setStartWidth] = useState<number>(0);
    const tableRef = useRef<HTMLTableElement>(null);

    // Parse HTML table into 2D array of cells
    useEffect(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const table = doc.querySelector('table');

        if (!table) return;

        const rows: TableCell[][] = [];
        const columnWidths: string[] = [];

        // Parse header rows
        const thead = table.querySelector('thead');
        if (thead) {
            const headerRows = thead.querySelectorAll('tr');
            headerRows.forEach(row => {
                const cells: TableCell[] = [];
                const ths = row.querySelectorAll('th');
                ths.forEach((th, index) => {
                    const widthAttr = th.getAttribute('style');
                    let width = '';
                    if (widthAttr) {
                        const widthMatch = widthAttr.match(/width:\s*([^;]+)/);
                        if (widthMatch) {
                            width = widthMatch[1].trim();
                        }
                    }

                    // Store column width from first row
                    if (rows.length === 0) {
                        columnWidths[index] = width;
                    }

                    cells.push({
                        content: th.innerHTML || '',
                        isHeader: true,
                        width
                    });
                });
                if (cells.length > 0) rows.push(cells);
            });
        }

        // Parse body rows
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const bodyRows = tbody.querySelectorAll('tr');
            bodyRows.forEach(row => {
                const cells: TableCell[] = [];
                const tds = row.querySelectorAll('td');
                tds.forEach((td, index) => {
                    const widthAttr = td.getAttribute('style');
                    let width = '';
                    if (widthAttr) {
                        const widthMatch = widthAttr.match(/width:\s*([^;]+)/);
                        if (widthMatch) {
                            width = widthMatch[1].trim();
                        }
                    }

                    // Store column width from first row if not already stored
                    if (rows.length === 0 && columnWidths[index] === undefined) {
                        columnWidths[index] = width;
                    }

                    cells.push({
                        content: td.innerHTML || '',
                        isHeader: false,
                        width
                    });
                });
                // If no tds found, check for ths in tbody
                if (cells.length === 0) {
                    const ths = row.querySelectorAll('th');
                    ths.forEach((th, index) => {
                        const widthAttr = th.getAttribute('style');
                        let width = '';
                        if (widthAttr) {
                            const widthMatch = widthAttr.match(/width:\s*([^;]+)/);
                            if (widthMatch) {
                                width = widthMatch[1].trim();
                            }
                        }

                        // Store column width from first row if not already stored
                        if (rows.length === 0 && columnWidths[index] === undefined) {
                            columnWidths[index] = width;
                        }

                        cells.push({
                            content: th.innerHTML || '',
                            isHeader: true,
                            width
                        });
                    });
                }
                if (cells.length > 0) rows.push(cells);
            });
        }

        // If no thead or tbody found, parse all tr elements directly
        if (rows.length === 0) {
            const allRows = table.querySelectorAll('tr');
            allRows.forEach(row => {
                const cells: TableCell[] = [];
                const tds = row.querySelectorAll('td');
                const ths = row.querySelectorAll('th');

                // Process headers first
                ths.forEach((th, index) => {
                    const widthAttr = th.getAttribute('style');
                    let width = '';
                    if (widthAttr) {
                        const widthMatch = widthAttr.match(/width:\s*([^;]+)/);
                        if (widthMatch) {
                            width = widthMatch[1].trim();
                        }
                    }

                    // Store column width from first row if not already stored
                    if (rows.length === 0 && columnWidths[index] === undefined) {
                        columnWidths[index] = width;
                    }

                    cells.push({
                        content: th.innerHTML || '',
                        isHeader: true,
                        width
                    });
                });

                // Then process data cells
                tds.forEach((td, index) => {
                    const widthAttr = td.getAttribute('style');
                    let width = '';
                    if (widthAttr) {
                        const widthMatch = widthAttr.match(/width:\s*([^;]+)/);
                        if (widthMatch) {
                            width = widthMatch[1].trim();
                        }
                    }

                    // Store column width from first row if not already stored
                    if (rows.length === 0 && columnWidths[index] === undefined) {
                        columnWidths[index] = width;
                    }

                    cells.push({
                        content: td.innerHTML || '',
                        isHeader: false,
                        width
                    });
                });

                if (cells.length > 0) rows.push(cells);
            });
        }

        setTableData(rows);
    }, [html]);

    // Convert table data back to HTML
    const tableDataToHtml = (data: TableCell[][]): string => {
        if (data.length === 0) return '';

        let html = '<table class="note-table">\n';

        // Check if first row contains headers
        const hasHeaderRow = data.length > 0 && data[0].some(cell => cell.isHeader);

        if (hasHeaderRow) {
            html += '  <thead>\n    <tr>\n';
            data[0].forEach(cell => {
                const tag = cell.isHeader ? 'th' : 'td';
                const widthAttr = cell.width ? ` style="width: ${cell.width}"` : '';
                html += `      <${tag}${widthAttr}>${cell.content}</${tag}>\n`;
            });
            html += '    </tr>\n  </thead>\n';

            // Add body with remaining rows
            if (data.length > 1) {
                html += '  <tbody>\n';
                for (let i = 1; i < data.length; i++) {
                    html += '    <tr>\n';
                    data[i].forEach((cell, colIndex) => {
                        const tag = cell.isHeader ? 'th' : 'td';
                        // Use width from header row for consistency
                        const width = data[0][colIndex]?.width || cell.width;
                        const widthAttr = width ? ` style="width: ${width}"` : '';
                        html += `      <${tag}${widthAttr}>${cell.content}</${tag}>\n`;
                    });
                    html += '    </tr>\n';
                }
                html += '  </tbody>\n';
            }
        } else {
            // No headers, put everything in tbody
            html += '  <tbody>\n';
            data.forEach(row => {
                html += '    <tr>\n';
                row.forEach(cell => {
                    const tag = cell.isHeader ? 'th' : 'td';
                    const widthAttr = cell.width ? ` style="width: ${cell.width}"` : '';
                    html += `      <${tag}${widthAttr}>${cell.content}</${tag}>\n`;
                });
                html += '    </tr>\n';
            });
            html += '  </tbody>\n';
        }

        html += '</table>';
        return html;
    };

    // Handle cell click
    const handleCellClick = (rowIndex: number, colIndex: number) => {
        setEditingCell({ row: rowIndex, col: colIndex });
        setTempValue(tableData[rowIndex][colIndex].content);
    };

    // Handle cell value change
    const handleCellChange = (value: string) => {
        setTempValue(value);
    };

    // Save cell value
    const saveCell = () => {
        if (!editingCell) return;

        const newData = [...tableData];
        newData[editingCell.row][editingCell.col] = {
            ...newData[editingCell.row][editingCell.col],
            content: tempValue
        };

        setTableData(newData);
        onChange(tableDataToHtml(newData));
        setEditingCell(null);
        setTempValue('');
    };

    // Cancel cell editing
    const cancelEdit = () => {
        setEditingCell(null);
        setTempValue('');
    };

    // Handle column resize start
    const handleResizeStart = (e: React.MouseEvent, colIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingColumn(colIndex);
        setStartX(e.clientX);

        // Get current width from the column
        const currentWidth = tableData[0]?.[colIndex]?.width;
        if (currentWidth && currentWidth.endsWith('px')) {
            setStartWidth(parseInt(currentWidth));
        } else {
            // Default to 150px if no width is set
            setStartWidth(150);
        }
    };

    // Handle column resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizingColumn === null) return;

            const diff = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

            const newData = [...tableData];
            // Update width for all rows in the column
            for (let i = 0; i < newData.length; i++) {
                newData[i][resizingColumn] = {
                    ...newData[i][resizingColumn],
                    width: `${newWidth}px`
                };
            }

            setTableData(newData);
        };

        const handleMouseUp = () => {
            if (resizingColumn !== null) {
                onChange(tableDataToHtml(tableData));
                setResizingColumn(null);
                document.body.classList.remove('resizing-column');
            }
        };

        if (resizingColumn !== null) {
            document.body.classList.add('resizing-column');
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.body.classList.remove('resizing-column');
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [resizingColumn, startX, startWidth, tableData, onChange]);

    // Add new row
    const addRow = (position: 'top' | 'bottom' = 'bottom') => {
        if (tableData.length === 0) return;

        const cols = tableData[0].length;
        const newRow: TableCell[] = Array(cols).fill(null).map(() => ({
            content: '',
            isHeader: false
        }));

        const newData = [...tableData];
        if (position === 'top') {
            newData.unshift(newRow);
        } else {
            newData.push(newRow);
        }

        setTableData(newData);
        onChange(tableDataToHtml(newData));
    };

    // Add new column
    const addColumn = (position: 'left' | 'right' = 'right') => {
        if (tableData.length === 0) return;

        const newData = tableData.map(row => {
            const newCell: TableCell = {
                content: '',
                isHeader: row[0]?.isHeader || false
            };

            if (position === 'left') {
                return [newCell, ...row];
            } else {
                return [...row, newCell];
            }
        });

        setTableData(newData);
        onChange(tableDataToHtml(newData));
    };

    // Delete row
    const deleteRow = (rowIndex: number) => {
        if (tableData.length <= 1) return;

        const newData = tableData.filter((_, index) => index !== rowIndex);
        setTableData(newData);
        onChange(tableDataToHtml(newData));
    };

    // Delete column
    const deleteColumn = (colIndex: number) => {
        if (tableData.length === 0 || tableData[0].length <= 1) return;

        const newData = tableData.map(row =>
            row.filter((_, index) => index !== colIndex)
        );

        setTableData(newData);
        onChange(tableDataToHtml(newData));
    };

    // Handle drag start
    const handleDragStart = (e: React.DragEvent, rowIndex: number) => {
        setDraggedRow(rowIndex);
        e.dataTransfer.effectAllowed = 'move';

        // Add a custom drag image if needed
        const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
        dragImage.style.opacity = '0.5';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, rowIndex: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedRow !== null && draggedRow !== rowIndex) {
            setDragOverRow(rowIndex);
        }
    };

    // Handle drag leave
    const handleDragLeave = () => {
        setDragOverRow(null);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent, targetRowIndex: number) => {
        e.preventDefault();

        if (draggedRow === null || draggedRow === targetRowIndex) {
            setDraggedRow(null);
            setDragOverRow(null);
            return;
        }

        // Create a new array with reordered rows
        const newData = [...tableData];
        const draggedRowData = newData[draggedRow];

        // Remove the dragged row
        newData.splice(draggedRow, 1);

        // Insert the dragged row at the new position
        const insertIndex = draggedRow < targetRowIndex ? targetRowIndex - 1 : targetRowIndex;
        newData.splice(insertIndex, 0, draggedRowData);

        setTableData(newData);
        onChange(tableDataToHtml(newData));
        setDraggedRow(null);
        setDragOverRow(null);
    };

    // Handle drag end
    const handleDragEnd = () => {
        setDraggedRow(null);
        setDragOverRow(null);
    };

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (editingCell) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveCell();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editingCell, tempValue]);

    if (tableData.length === 0) {
        return <div>Invalid table format</div>;
    }

    return (
        <div className="my-4">
            <div className="editable-table-controls">
                <button
                    onClick={() => addRow('top')}
                    className="editable-table-button"
                    title="Add row above"
                >
                    <Plus className="w-3 h-3" /> Row Above
                </button>
                <button
                    onClick={() => addRow('bottom')}
                    className="editable-table-button"
                    title="Add row below"
                >
                    <Plus className="w-3 h-3" /> Row Below
                </button>
                <button
                    onClick={() => addColumn('left')}
                    className="editable-table-button"
                    title="Add column left"
                >
                    <Plus className="w-3 h-3" /> Col Left
                </button>
                <button
                    onClick={() => addColumn('right')}
                    className="editable-table-button"
                    title="Add column right"
                >
                    <Plus className="w-3 h-3" /> Col Right
                </button>
            </div>

            <div className="overflow-x-auto">
                <table
                    className="w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm"
                >
                    <thead>
                        {tableData.length > 0 && (
                            <tr>
                                <th className="border border-gray-300 dark:border-gray-600 px-1 py-2 bg-gray-50 dark:bg-gray-800 w-8"></th>
                                {tableData[0].map((cell, colIndex) => (
                                    <th
                                        key={colIndex}
                                        className={`editable-table-cell border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold relative`}
                                        style={{ width: cell.width || 'auto' }}
                                    >
                                        <div
                                            className="cursor-text"
                                            onClick={() => handleCellClick(0, colIndex)}
                                            dangerouslySetInnerHTML={{ __html: cell.content }}
                                        />
                                        <div
                                            className="resize-handle"
                                            onMouseDown={(e) => handleResizeStart(e, colIndex)}
                                            title="Drag to resize column"
                                        />
                                    </th>
                                ))}
                                <th className="border border-gray-300 dark:border-gray-600 px-1 py-2 bg-gray-50 dark:bg-gray-800"></th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {tableData.slice(1).map((row, rowIndex) => (
                            <tr
                                key={rowIndex + 1}
                                className={`group table-row-transition ${draggedRow === rowIndex + 1 ? 'dragging table-row-dragging' : ''
                                    } ${dragOverRow === rowIndex + 1 ? 'drag-over' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, rowIndex + 1)}
                                onDragOver={(e) => handleDragOver(e, rowIndex + 1)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, rowIndex + 1)}
                                onDragEnd={handleDragEnd}
                            >
                                <td className="border border-gray-300 dark:border-gray-600 px-1 py-2 bg-gray-50 dark:bg-gray-800 drag-handle opacity-0 group-hover:opacity-100 transition-opacity w-8">
                                    <GripVertical className="w-4 h-4 mx-auto text-gray-400" />
                                </td>
                                {row.map((cell, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`editable-table-cell border border-gray-300 dark:border-gray-600 px-4 py-2 ${cell.isHeader
                                            ? 'bg-gray-100 dark:bg-gray-800 font-semibold'
                                            : 'bg-white dark:bg-gray-900'
                                            } ${editingCell?.row === rowIndex + 1 && editingCell?.col === colIndex
                                                ? 'ring-2 ring-blue-500'
                                                : 'cursor-text'
                                            }`}
                                        style={{ width: cell.width || 'auto' }}
                                        onClick={() => handleCellClick(rowIndex + 1, colIndex)}
                                    >
                                        {editingCell?.row === rowIndex + 1 && editingCell?.col === colIndex ? (
                                            <input
                                                type="text"
                                                value={tempValue}
                                                onChange={(e) => handleCellChange(e.target.value)}
                                                onBlur={saveCell}
                                                autoFocus
                                            />
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: cell.content }} />
                                        )}
                                    </td>
                                ))}
                                <td className="border border-gray-300 dark:border-gray-600 px-1 py-2 bg-gray-50 dark:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => deleteRow(rowIndex + 1)}
                                        className="delete-button"
                                        title="Delete row"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"></td>
                            {tableData[0]?.map((_, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="border border-gray-300 dark:border-gray-600 px-1 py-2 bg-gray-50 dark:bg-gray-800 opacity-0 hover:opacity-100 transition-opacity"
                                >
                                    <button
                                        onClick={() => deleteColumn(colIndex)}
                                        className="delete-button"
                                        title="Delete column"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </td>
                            ))}
                            <td className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
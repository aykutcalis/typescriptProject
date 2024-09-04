import React, { useState } from "react";
import styled from "styled-components";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "react-beautiful-dnd";
import { nanoid } from "nanoid";
import { Modal, Button } from "react-bootstrap";

// Alıntıların tipini tanımlayan TypeScript arayüzü
interface QuoteType {
  id: string;
  content: string;
}

// Başlangıçta listeyi boş tutuyoruz
const initial: QuoteType[] = [];
const grid = 8; // Grid boyutu

// Liste elemanlarının sıralamasını değiştiren fonksiyon
const reorder = (list: QuoteType[], startIndex: number, endIndex: number): QuoteType[] => {
  const result = Array.from(list); // Listeyi kopyala
  const [removed] = result.splice(startIndex, 1); // Başlangıçtaki elemanı kaldır
  result.splice(endIndex, 0, removed); // Elemanı hedef konuma ekle
  return result; // Yeni sıralı listeyi döndür
};

// Alıntı öğesi için stil bileşeni
const QuoteItem = styled.div`
  width: 200px;
  border: 1px solid grey;
  margin-bottom: ${grid}px;
  background-color: lightblue;
  padding: ${grid}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Silme butonu için stil bileşeni
const DeleteButton = styled.button`
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
`;

// Düzenleme butonu için stil bileşeni
const EditButton = styled.button`
  background: blue;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  margin-left: ${grid}px;
`;

// Girdi alanı ve buton için stil bileşenleri
const InputContainer = styled.div`
  margin-bottom: ${grid * 2}px;
  display: flex;
  gap: ${grid}px;
  align-items: center;
`;

const InputField = styled.input`
  padding: ${grid / 2}px;
  border: 1px solid grey;
  border-radius: 4px;
  flex: 1;
  max-width: 200px;
`;

const AddButton = styled.button`
  background: green;
  color: white;
  border: none;
  padding: ${grid}px;
  cursor: pointer;
`;

// Alıntı bileşeni
function Quote({ quote, index, onEdit, onDelete }: { quote: QuoteType; index: number; onEdit: () => void; onDelete: () => void }) {
  return (
    <Draggable draggableId={quote.id} index={index}>
      {(provided) => (
        <QuoteItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {quote.content}
          <div>
            <EditButton onClick={onEdit}>Edit</EditButton>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
          </div>
        </QuoteItem>
      )}
    </Draggable>
  );
}

// Alıntı listesini render eden bileşen
const QuoteList = React.memo(function QuoteList({ quotes, onEdit, onDelete }: { quotes: QuoteType[]; onEdit: (index: number) => void; onDelete: (index: number) => void }) {
  return quotes.map((quote: QuoteType, index: number) => (
    <Quote
      quote={quote}
      index={index}
      key={quote.id}
      onEdit={() => onEdit(index)}
      onDelete={() => onDelete(index)}
    />
  ));
});

// Ana uygulama bileşeni
function QuoteApp() {
  const [quotes, setQuotes] = useState<QuoteType[]>(initial); // Alıntılar için durum
  const [newQuote, setNewQuote] = useState(""); // Yeni alıntı için durum
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Düzenleme diyalogu açık mı
  const [editQuoteIndex, setEditQuoteIndex] = useState<number | null>(null); // Düzenlenen alıntının indeksi
  const [editQuoteContent, setEditQuoteContent] = useState(""); // Düzenlenen alıntının içeriği

  // Sürükleme ve bırakma işlemi tamamlandığında çağrılan fonksiyon
  function onDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) {
      return; // Varış noktası yoksa veya yer değiştirmediyse, hiçbir şey yapma
    }
    const reorderedQuotes = reorder(
      quotes,
      result.source.index,
      result.destination.index
    );
    setQuotes(reorderedQuotes); // Güncellenmiş sıralamayı duruma uygula
  }

  // Alıntıyı silme fonksiyonu
  function handleDelete(index: number) {
    const newQuotes = quotes.filter((_, i) => i !== index); // Belirli indekse sahip alıntıyı filtrele
    setQuotes(newQuotes); // Yeni listeyi duruma uygula
  }

  // Yeni alıntıyı ekleme fonksiyonu
  function handleAddQuote() {
    if (newQuote.trim()) {
      const newQuoteObj: QuoteType = {
        id: nanoid(), // Yeni alıntı için benzersiz ID
        content: newQuote.trim(),
      };
      setQuotes([...quotes, newQuoteObj]); // Yeni alıntıyı listeye ekle
      setNewQuote(""); // Girdi alanını temizle
    }
  }

  // Alıntıyı düzenleme fonksiyonu
  function handleEdit(index: number) {
    setEditQuoteIndex(index); // Düzenleme için seçilen alıntının indeksini ayarla
    setEditQuoteContent(quotes[index].content); // Düzenleme için alıntı içeriğini ayarla
    setEditDialogOpen(true); // Düzenleme diyalogunu aç
  }

  // Düzenleme işlemini kaydetme fonksiyonu
  function handleEditSave() {
    if (editQuoteIndex !== null) {
      const updatedQuotes = quotes.map((quote, index) =>
        index === editQuoteIndex ? { ...quote, content: editQuoteContent } : quote
      );
      setQuotes(updatedQuotes); // Güncellenmiş listeyi duruma uygula
      handleEditClose(); // Düzenleme diyalogunu kapat
    }
  }

  // Düzenleme diyalogunu kapatma fonksiyonu
  function handleEditClose() {
    setEditDialogOpen(false);
    setEditQuoteIndex(null);
    setEditQuoteContent("");
  }

  return (
    <div>
      <InputContainer>
        <InputField
          type="text"
          value={newQuote}
          onChange={(e) => setNewQuote(e.target.value)}
          placeholder="Add a new quote"
        />
        <AddButton onClick={handleAddQuote}>Add</AddButton>
      </InputContainer>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <QuoteList quotes={quotes} onEdit={handleEdit} onDelete={handleDelete} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal show={editDialogOpen} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Quote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputField
            type="text"
            value={editQuoteContent}
            onChange={(e) => setEditQuoteContent(e.target.value)}
            placeholder="Edit quote"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default QuoteApp;

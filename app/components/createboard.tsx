"use client";

import { Button } from "@nextui-org/button";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure, Input, ModalFooter } from "@nextui-org/react";
import { useState } from "react";

const createBoardFunc = async (name: string) => {
  return await fetch("/api/board/create", {
    method: "POST",
    headers: {
      "boardName": name
    }
  });
}

export default function CreateBoard() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [name, setName] = useState<string>("");

  return (
    <>
      <Button variant="shadow" color="primary" onClick={onOpen}>
        Create new board
      </Button>
      <Modal className="dark" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create a new whiteboard.</ModalHeader>
              <ModalBody>
                <Input isRequired onChange={(e) => setName(e.target.value)} label="Name" />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" disabled={!name} onClick={() => {
                  createBoardFunc(name).then((res) => {
                    if (res.status === 200) {
                      res.json().then((data) => {
                        window.location.href = `/board/${data.id}`;
                      })
                    }
                  })
                }}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

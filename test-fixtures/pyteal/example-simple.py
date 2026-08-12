"""
Simple PyTeal example for testing
Basic approval program
"""

from pyteal import *

def approval_program():
    """
    Simple approval program that accepts creation and NoOp calls
    """
    
    handle_creation = Return(Int(1))
    
    handle_noop = Return(Int(1))
    
    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
    )
    
    return program

def clear_state_program():
    """
    Clear state program
    """
    return Return(Int(1))

if __name__ == "__main__":
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))

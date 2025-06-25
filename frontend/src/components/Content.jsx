import React, { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  Typography,
  Paper,
  Container,
  CardHeader,
  CardContent,
  CardActions,
  Box
} from "@mui/material";
import { ContractAgreement, managerContract } from '../features/entities';
import { useDispatch, useSelector } from 'react-redux';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { createAgreement } from '../features/contract';
import {
  selectCurrUser, selectUsersAll, toUpdate,

  toAddToBalance,
  toDecreaseFromBalance
} from '../usersSlice';

const Content = () => {

  const user = useSelector(selectCurrUser)
  const users = useSelector(selectUsersAll)
  const dispatch = useDispatch()



  // const [currButton, setCurrButton] = useState(buttons.startRent)
  let paymentRent = null

  const buttons = {

    startRent: (property) => (<Button
      variant="contained"
      color="primary"
      onClick={() => handleRent(property)}
    >
      Начать аренду
    </Button>),

    canselRent: (property) => (
      <Button
        variant="outlined"
        color="error"
        onClick={() => handleCancel(property)}
      >
        Отменить аренду
      </Button>
    ),
    actionUser: (property) => (
      <Button
        variant="outlined"
        color="success"
        onClick={() => handleGetPayment(property)}
      >

        Получить деньги

      </Button>)
  }

  const [properties, setProperties] = React.useState([
    {
      id: 1,
      status: 'Available',
      metadata: 'ул. Примерная, 123',
      pricePerDay: 500,
      landlord: 'User 1',
      tenant: null,
      rentDays: 15,
      deposit: 500,
      isGetedDeposit: false,
      isGetedrentPayment: false
    },
    {
      id: 2,
      status: 'Available',
      metadata: 'ул. Тестовая, 456',
      pricePerDay: 700,
      landlord: "User 2",
      tenant: null,
      rentDays: 5,
      deposit: 1000,
      isGetedDeposit: false,
      isGetedrentPayment: false
    }
  ]);

  if (properties.length === 0) {
    return <div>Загрузка...</div>;
  }

  function changeButton(property) {


    switch (property.status) {
      case "Available":
        return buttons.startRent(property);
      case "Rented":
        return buttons.canselRent(property)
      case "Cancelled":
        return buttons.actionUser(property)
    }
  }



  const handleRent = (proccedproperty) => {

    console.log(user.name)
    if (proccedproperty.landlord === user.name) {
      return
    }
    const oldBalance = user.balance
    paymentRent = proccedproperty.deposit + proccedproperty.rentDays * proccedproperty.pricePerDay



    dispatch(toDecreaseFromBalance({ name: user.name, count: paymentRent }))

    dispatch(toUpdate(
      users.map(_user => _user.name === user.name ? { ..._user, balance: oldBalance - paymentRent } : _user)
    ))

    setProperties(properties.map(property =>
      property.id === proccedproperty.id && property.landlord !== user.name ? { ...property, status: 'Rented', tenant: user.name } : property
    ));



  };
  const handleCancel = (proccedproperty) => {
    setProperties(properties.map(property =>
      property.id === proccedproperty.id ? { ...property, status: 'Cancelled' } : property
    ));
  };

  const handleGetPayment = (proccedproperty) => {

    if (
      proccedproperty.landlord === user.name && !proccedproperty.isGetedrentPayment
    ) {

      dispatch(toAddToBalance({ name: user.name, count:  proccedproperty.rentDays * proccedproperty.pricePerDay }))

      
      dispatch(toUpdate(
        users.map(_user => _user.name === user.name ? { ..._user, balance:  user.balance + ( proccedproperty.rentDays * proccedproperty.pricePerDay) } : _user)
      ))

      proccedproperty.isGetedrentPayment = true

      console.log(proccedproperty.isGetedrentPayment)

    }
    if (
      proccedproperty.tenant === user.name && !proccedproperty.isGetedDeposit
    ) {
      dispatch(toAddToBalance({ name: user.name, count: proccedproperty.deposit }))


      dispatch(toUpdate(
        users.map(_user => _user.name === user.name ? { ..._user, balance: user.balance + proccedproperty.deposit } : _user)
      ))

      proccedproperty.isGetedDeposit = true
      console.log(2)

    }
    if (
      proccedproperty.isGetedDeposit && proccedproperty.isGetedrentPayment
    ) {
      setProperties(properties.map(property =>
        property.id === proccedproperty.id ? { ...property, status: 'Available', tenant: null } : property
      ));
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Управление арендой жилья
        </Typography>

        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} key={property.id}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <CardHeader
                  title={`Жилье #${property.id}`}
                  subheader={property.metadata}
                />
                <CardContent>
                  <Typography variant="body1">
                    Статус: {property.status === 'Available' ? 'Доступно' :
                      property.status === 'Rented' ? 'Арендовано' : 'Отменено'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Цена: {property.pricePerDay} ETH/день
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Владелец: {property.landlord}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Срок аренды: {property.rentDays} дней
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Депозит: {property.deposit} ETH
                  </Typography>
                  {property.tenant ?
                    <Typography variant="body2" color="text.secondary">
                      Арендатор: {property.tenant}
                    </Typography> :
                    null}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>

                  {
                    changeButton(property)
                  }
                </CardActions>
              </Paper>
            </Grid>

          ))}
          <Grid item xs={12} sm={6} style={{ display: "flex", textAlign: 'center' }}>
            <Button>
              <ControlPointIcon fontSize='large' />
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Content;
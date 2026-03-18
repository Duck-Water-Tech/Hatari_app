// ⭐ ITEM DETAILS SCREEN — CLEAN & ENHANCED
import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFoodOrders} from '../redux/slice/getfoodorderSlice';
import {fetchUserAddresses} from '../redux/slice/saveaddressSlice';
import DashboardScreen from '../components/DashboardScreen';
import CustomHeader from '../components/CustomHeader';
import {CommonActions, useFocusEffect, useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Theme from '../assets/theme';

const ItemDetalis = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {orders, loading, error} = useSelector(state => state.foodOrder);
  const {addresses = []} = useSelector(state => state.address);

  const orderData = orders?.data || [];
    
useFocusEffect(
  useCallback(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Bottom',
                state: {
                  routes: [{ name: 'HomeScreen' }],
                },
              },
            ],
          })
        );
        return true; // ⛔ block default back
      }
    );

    return () => backHandler.remove(); // ✅ correct cleanup
  }, [navigation])
);

  useEffect(() => {
    dispatch(fetchFoodOrders());
    dispatch(fetchUserAddresses());
  }, [dispatch]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.red} />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );

  if (orderData.length === 0)
    return (
      <View style={styles.center}>
        <Image
          source={{uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076500.png'}}
          style={{width: 120, height: 120, marginBottom: 20}}
        />
        <Text style={styles.noDataText}>No orders found yet</Text>
        <Text style={{color: '#999', marginTop: 6}}>
          Start ordering delicious food 🍔
        </Text>
      </View>
    );

  const toNumber = value => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const getSelectedPrice = food => {
    if (!food) return 0;

    const variant = String(food?.variant || '').toLowerCase();
    if (variant === 'full' || variant === 'fullprice') {
      return toNumber(
        food?.fullPrice ??
          food?.priceInfo?.fullPrice ??
          food?.foodId?.priceInfo?.fullPrice ??
          0,
      );
    }

    if (variant === 'half' || variant === 'halfprice') {
      return toNumber(
        food?.halfPrice ??
          food?.priceInfo?.halfPrice ??
          food?.foodId?.priceInfo?.halfPrice ??
          0,
      );
    }

    return toNumber(
      food?.unitPrice ??
        food?.price ??
        food?.totalPrice ??
        food?.priceInfo?.staticPrice ??
        food?.foodId?.priceInfo?.staticPrice ??
        food?.fullPrice ??
        food?.halfPrice ??
        food?.foodId?.priceInfo?.fullPrice ??
        food?.foodId?.priceInfo?.halfPrice ??
        0,
    );
  };

  const getAddOnsTotal = food => {
    if (!food?.addOns || food.addOns.length === 0) return 0;
    return food.addOns.reduce(
      (sum, addon) => sum + toNumber(addon?.price) * toNumber(addon?.quantity || 1),
      0,
    );
  };

  const resolveAddressInfo = item => {
    const rawAddress = item?.address;
    const addressId =
      typeof rawAddress === 'string'
        ? rawAddress
        : rawAddress?._id || rawAddress?.id || rawAddress?.addressId;

    const matchedAddress =
      addresses.find(addr => addr?._id === addressId || addr?.id === addressId) || {};

    const addressObj =
      rawAddress && typeof rawAddress === 'object'
        ? {...matchedAddress, ...rawAddress}
        : matchedAddress;

    const name = addressObj?.name || item?.billingName || 'Customer';
    const phone =
      addressObj?.mobileNumber || addressObj?.contact || item?.billingMobile || 'N/A';
    const line =
      addressObj?.address ||
      [
        addressObj?.apartment,
        addressObj?.house,
        addressObj?.street,
        addressObj?.area,
        addressObj?.city,
        addressObj?.pin || addressObj?.pincode,
        addressObj?.state,
      ]
        .filter(Boolean)
        .join(', ');

    return {
      name,
      phone,
      line,
    };
  };

  return (
    <>
      <CustomHeader title="My Order" />
      <DashboardScreen scrollable={false}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {orderData.map((item, index) => {
            const restaurant = item?.restaurant || {};
            const foodDetails = item?.foodDetails || [];
            const status = item?.deliveryStatus || 'Ordered';
            const paymentStatus = item?.paymentStatus || 0;
            const orderId = item?._id ? `#${String(item._id).slice(-6).toUpperCase()}` : 'N/A';
            const {name: addressName, phone: addressPhone, line: addressLine} =
              resolveAddressInfo(item);
            const isDelivery = String(item?.type || 'delivery').toLowerCase() === 'delivery';
            const statusColor =
              status === 'Delivered'
                ? '#4BB543'
                : status === 'Cancelled'
                ? '#d24942'
                : '#FF9500';

            return (
              <TouchableOpacity
                key={item._id || index}
                style={styles.orderCard}
                activeOpacity={0.9}
             >

                {/* RESTAURANT HEADER */}
                <View style={styles.headerRow}>
                  <Image
                    source={{
                      uri:
                        restaurant?.image ||
                        'https://cdn-icons-png.flaticon.com/512/2921/2921820.png',
                    }}
                    style={styles.restaurantImage}
                  />
                  <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={styles.restaurantName}>
                      {restaurant?.name || 'Restaurant'}
                    </Text>
                    <Text style={styles.orderMeta}>Order {orderId}</Text>
                  </View>
                  <View style={styles.statusBadge(statusColor)}>
                    <Text style={styles.statusBadgeText}>{status}</Text>
                  </View>
                </View>

                {/* FOOD ITEMS */}
                <View style={styles.foodListContainer}>
                  {foodDetails.map((food, idx) => {
                    const basePrice = getSelectedPrice(food);
                    const addOnsTotal = getAddOnsTotal(food);
                    const quantity = toNumber(food?.quantity || 1);
                    const totalPrice = (basePrice + addOnsTotal) * quantity;

                    return (
                      <View key={idx} style={styles.foodRow}>
                        <Image
                          source={{
                            uri:
                              food?.food?.image ||
                              food?.foodId?.image ||
                              'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
                          }}
                          style={styles.foodImage}
                        />

                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName}>
                            {food?.foodId?.name || 'Food Item'}
                          </Text>
                          <Text style={styles.foodDesc}>
                            Qty: {food?.quantity} |
                            {(food?.variant === 'fullPrice' || food?.variant === 'full') &&
                              ' Full Price'}
                            {(food?.variant === 'halfPrice' || food?.variant === 'half') &&
                              ' Half Price'}
                            {!food?.variant && ' Static Price'}
                          </Text>

                          {/* AddOns */}
                          {food?.addOns?.length > 0 && (
                            <View style={{marginTop: 4}}>
                              {food.addOns.map((ad, i) => (
                                <Text key={i} style={styles.addOnText}>
                                  {ad.name} (+₹{ad.price} x {ad.quantity})
                                </Text>
                              ))}
                            </View>
                          )}

                          {/* Note */}
                          {food?.note && (
                            <Text style={[styles.foodDesc, {fontStyle: 'italic'}]}>
                              Note: {food.note}
                            </Text>
                          )}
                        </View>

                        {/* PRICE */}
                        <View style={styles.foodPriceBox}>
                          <Text style={styles.foodPrice}>₹ {totalPrice.toFixed(2)}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* FOOTER */}
                <View style={styles.footerRow}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons
                      name={paymentStatus === 1 ? 'check-circle' : 'pending-actions'}
                      size={18}
                      color={paymentStatus === 1 ? '#4BB543' : '#FF3B30'}
                    />
                    <Text
                      style={[
                        styles.paymentStatus,
                        {color: paymentStatus === 1 ? '#4BB543' : '#FF3B30'},
                      ]}>
                      {paymentStatus === 1 ? 'Paid' : 'Pending'}
                    </Text>
                  </View>

                  {isDelivery && (
                    <View style={styles.addressBox}>
                      <MaterialIcons name="location-on" size={20} color="#FF6347" />
                      <View style={styles.addressContent}>
                        <Text style={styles.addressTitle}>Delivery Address</Text>
                        <Text style={styles.addressText}>{addressName}</Text>
                        <Text style={styles.addressText}>
                          {addressLine || 'Address not available'}
                        </Text>
                        <Text style={styles.addressText}>Phone: {addressPhone}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </DashboardScreen>
    </>
  );
};

export default ItemDetalis;


/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EE',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F2E3D8',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  orderMeta: {
    marginTop: 2,
    color: '#8B7D72',
    fontSize: 12,
    fontWeight: '600',
  },

  statusBadge: color => ({
    backgroundColor: color + '15',
    borderColor: color,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  }),
  statusBadgeText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
  },

  foodListContainer: {
    marginTop: 10,
    backgroundColor: '#FFF9F6',
    borderRadius: 12,
    paddingVertical: 8,
  },

  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F6ECE5',
  },

  foodImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },

  foodInfo: {
    flex: 1,
    marginLeft: 12,
  },

  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  foodDesc: {
    fontSize: 13,
    color: '#6A6A6A',
    marginTop: 2,
  },

  addOnText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },

  foodPriceBox: {
    backgroundColor: '#FFF6F3',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  foodPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6347',
  },

  footerRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    rowGap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2E9E2',
    paddingTop: 10,
  },

  paymentStatus: {marginLeft: 6, fontSize: 13, fontWeight: '600'},
  viewDetailsButton: {
    backgroundColor: Theme.colors.red,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewDetailsText: {color: '#fff', fontWeight: '600', fontSize: 12},

  errorText: {color: 'red', fontSize: 16, textAlign: 'center'},
  noDataText: {color: '#333', fontSize: 16, fontWeight: '600'},
  addressBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF4EE',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD9C8',
  },
  addressContent: {
    marginLeft: 8,
    flex: 1,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B3F36',
  },
  addressText: {
    fontSize: 12,
    color: '#6D5C51',
    marginTop: 2,
  },
});
